"""
Pipeline Service — orchestrates the full product flow:
  ATS score → shortlist → create interviews → schedule → email candidates
"""
import logging
import asyncio
import os
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class PipelineService:
    """Orchestrates the ATS scoring → shortlisting → scheduling pipeline."""

    def __init__(self, db, ats_service, email_service, frontend_url: str = None):
        self.db = db
        self.ats = ats_service
        self.email = email_service
        self.frontend_url = frontend_url or os.environ.get('FRONTEND_URL', 'http://localhost:3000')

    def score_applications(self, job):
        """Score all 'applied' applications for a job. Synchronous wrapper around async ATS."""
        from models.models import CandidateApplication

        apps = CandidateApplication.query.filter_by(
            job_id=job.id, status='applied'
        ).all()

        if not apps:
            logger.info(f"No pending applications for job {job.id}")
            return []

        # Mark as scoring
        for app in apps:
            app.status = 'scoring'
        self.db.session.commit()

        # Build payload
        payload = [{'id': a.id, 'cv_text': a.cv_text or ''} for a in apps]

        # Run async scoring
        loop = asyncio.new_event_loop()
        try:
            results = loop.run_until_complete(
                self.ats.score_batch(
                    applications=payload,
                    job_title=job.title,
                    job_description=job.description,
                    job_requirements=job.requirements or ''
                )
            )
        finally:
            loop.close()

        # Write scores back
        for r in results:
            app = CandidateApplication.query.get(r['application_id'])
            if app:
                score_data = r['score_result']
                app.ats_score = score_data.get('overall_score', 0)
                app.ats_breakdown = score_data
                app.scored_at = datetime.utcnow()
                app.status = 'scored'

        self.db.session.commit()
        logger.info(f"✅ Scored {len(results)} applications for job {job.id}")
        return results

    def shortlist_top_n(self, job):
        """Shortlist top N candidates based on ATS score, reject the rest."""
        from models.models import CandidateApplication

        scored_apps = CandidateApplication.query.filter(
            CandidateApplication.job_id == job.id,
            CandidateApplication.status == 'scored',
            CandidateApplication.ats_score.isnot(None)
        ).order_by(CandidateApplication.ats_score.desc()).all()

        if not scored_apps:
            logger.info(f"No scored applications for job {job.id}")
            return [], []

        max_n = job.max_shortlist or 5
        shortlisted = scored_apps[:max_n]
        rejected = scored_apps[max_n:]

        for app in shortlisted:
            app.status = 'shortlisted'
            app.shortlisted_at = datetime.utcnow()

        for app in rejected:
            app.status = 'rejected'
            app.rejection_reason = f"Ranked below top {max_n} candidates (ATS score: {app.ats_score:.1f})"

        self.db.session.commit()

        # Send emails — scheduling invitations for shortlisted, rejection for rest
        for app in shortlisted:
            schedule_link = f"{self.frontend_url}/schedule/{app.id}"
            self.email.send_schedule_invitation(
                to_email=app.candidate_email,
                to_name=app.candidate_name,
                job_title=job.title,
                schedule_link=schedule_link,
            )
        for app in rejected:
            self.email.send_rejected(
                to_email=app.candidate_email,
                to_name=app.candidate_name,
                job_title=job.title
            )

        logger.info(f"✅ Shortlisted {len(shortlisted)}, rejected {len(rejected)} for job {job.id}")
        return [a.id for a in shortlisted], [a.id for a in rejected]

    def schedule_interviews(self, job, start_time: datetime = None, gap_minutes: int = 45):
        """Create Interview + InterviewSchedule for each shortlisted candidate and email them."""
        from models.models import CandidateApplication, Interview, InterviewSchedule, EmailLog

        shortlisted = CandidateApplication.query.filter_by(
            job_id=job.id, status='shortlisted'
        ).order_by(CandidateApplication.ats_score.desc()).all()

        if not shortlisted:
            logger.info(f"No shortlisted candidates for job {job.id}")
            return []

        # Default: start scheduling 24h from now
        slot_time = start_time or (datetime.utcnow() + timedelta(hours=24))
        duration = job.duration_minutes or 30
        schedules = []

        for app in shortlisted:
            # Create Interview record
            interview = Interview(
                job_id=job.id,
                application_id=app.id,
                candidate_name=app.candidate_name,
                candidate_email=app.candidate_email,
                candidate_phone=app.candidate_phone,
                cv_file_path=app.cv_file_path,
                status='pending'
            )
            self.db.session.add(interview)
            self.db.session.flush()  # get interview.id

            # Build meeting link
            meeting_link = f"{self.frontend_url}/interview/{job.id}?iid={interview.id}"

            # Create schedule
            schedule = InterviewSchedule(
                interview_id=interview.id,
                application_id=app.id,
                scheduled_at=slot_time,
                duration_minutes=duration,
                meeting_link=meeting_link,
                status='scheduled'
            )
            self.db.session.add(schedule)

            # Update application status
            app.status = 'scheduled'

            # Send email
            scheduled_str = slot_time.strftime('%B %d, %Y at %I:%M %p UTC')
            sent = self.email.send_shortlisted(
                to_email=app.candidate_email,
                to_name=app.candidate_name,
                job_title=job.title,
                interview_link=meeting_link,
                scheduled_at=scheduled_str
            )

            # Log email
            log = EmailLog(
                recipient_email=app.candidate_email,
                recipient_name=app.candidate_name,
                email_type='interview_invite',
                subject=f"You're Shortlisted — {job.title}",
                status='sent' if sent else 'failed',
                related_job_id=job.id,
                related_application_id=app.id,
                sent_at=datetime.utcnow() if sent else None
            )
            self.db.session.add(log)
            schedule.invitation_sent_at = datetime.utcnow() if sent else None

            schedules.append({
                'application_id': app.id,
                'interview_id': interview.id,
                'scheduled_at': slot_time.isoformat(),
                'meeting_link': meeting_link,
                'email_sent': sent
            })

            # Next slot
            slot_time += timedelta(minutes=gap_minutes)

        self.db.session.commit()
        logger.info(f"✅ Scheduled {len(schedules)} interviews for job {job.id}")
        return schedules

    def run_full_pipeline(self, job):
        """Run the entire pipeline: score → shortlist → schedule."""
        logger.info(f"🚀 Running full pipeline for job {job.id}: {job.title}")

        # Step 1: Score
        score_results = self.score_applications(job)

        # Step 2: Shortlist
        shortlisted_ids, rejected_ids = self.shortlist_top_n(job)

        # Step 3: Schedule interviews for shortlisted
        schedules = []
        if shortlisted_ids:
            schedules = self.schedule_interviews(job)

        return {
            'scored': len(score_results),
            'shortlisted': len(shortlisted_ids),
            'rejected': len(rejected_ids),
            'interviews_scheduled': len(schedules),
            'schedules': schedules
        }
