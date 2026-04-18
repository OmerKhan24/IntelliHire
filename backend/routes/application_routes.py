"""
Application & Pipeline Routes — candidate applications, ATS scoring, shortlisting, scheduling.
"""
from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
import logging
import os

from models.models import (
    db, Job, CandidateApplication, Interview, InterviewSchedule,
    EmailLog, Notification, User
)
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from werkzeug.utils import secure_filename

logger = logging.getLogger(__name__)

application_bp = Blueprint('applications', __name__, url_prefix='/api/applications')

# Service references — set by init_application_services()
ats_service = None
email_service = None
pipeline_service = None


def init_application_services(config):
    """Initialize ATS, email, and pipeline services."""
    global ats_service, email_service, pipeline_service

    deepseek_key = os.environ.get('DEEPSEEK_API_KEY', '')

    # ATS scorer
    try:
        from services.ats_scoring_service import ATSScoringService
        ats_service = ATSScoringService(api_key=deepseek_key)
        logger.info("✅ ATS Scoring service initialized")
    except Exception as e:
        logger.warning(f"⚠️ ATS Scoring service not available: {e}")

    # Email
    try:
        from services.email_service import EmailService
        email_service = EmailService(
            mailtrap_token=os.environ.get('MAILTRAP_API_TOKEN', ''),
        )
        logger.info("✅ Email service initialized")
    except Exception as e:
        logger.warning(f"⚠️ Email service not available: {e}")

    # Pipeline orchestrator
    try:
        from services.pipeline_service import PipelineService
        pipeline_service = PipelineService(
            db=db,
            ats_service=ats_service,
            email_service=email_service,
            frontend_url=os.environ.get('FRONTEND_URL', 'http://localhost:3000')
        )
        logger.info("✅ Pipeline service initialized")
    except Exception as e:
        logger.warning(f"⚠️ Pipeline service not available: {e}")


# ─── helper: extract CV text ──────────────────────────────
def _extract_cv_text(file_path):
    try:
        from utils.cv_parser import extract_text_from_cv
        return extract_text_from_cv(file_path) or ''
    except Exception as e:
        logger.warning(f"CV text extraction failed: {e}")
        return ''


# ─── helper: check role ───────────────────────────────────
def _get_current_user():
    uid = get_jwt_identity()
    return User.query.get(uid)


# ═══════════════════════════════════════════════════════════
#  PUBLIC: Job landing page (no auth)
# ═══════════════════════════════════════════════════════════
@application_bp.route('/job/<string:share_token>', methods=['GET', 'OPTIONS'])
def get_public_job(share_token):
    """Public endpoint — returns job info for the apply page."""
    if request.method == 'OPTIONS':
        return '', 200
    job = Job.query.filter_by(share_token=share_token, is_published=True).first()
    if not job:
        return jsonify({'error': 'Job not found or not published'}), 404
    app_count = CandidateApplication.query.filter_by(job_id=job.id).count()
    return jsonify({
        'success': True,
        'job': {
            'id': job.id,
            'title': job.title,
            'description': job.description,
            'requirements': job.requirements,
            'company_name': job.company_name,
            'location': job.location,
            'job_type': job.job_type,
            'salary_range': job.salary_range,
            'duration_minutes': job.duration_minutes,
            'application_deadline': job.application_deadline.isoformat() if job.application_deadline else None,
            'application_count': app_count,
        }
    })


# ═══════════════════════════════════════════════════════════
#  PUBLIC: Submit application (candidate)
# ═══════════════════════════════════════════════════════════
@application_bp.route('/apply', methods=['POST', 'OPTIONS'])
def apply_to_job():
    """Candidate submits an application with CV upload."""
    if request.method == 'OPTIONS':
        return '', 200
    try:
        share_token = request.form.get('share_token')
        if not share_token:
            return jsonify({'error': 'share_token is required'}), 400

        job = Job.query.filter_by(share_token=share_token, is_published=True).first()
        if not job:
            return jsonify({'error': 'Job not found or not accepting applications'}), 404

        # Check deadline (computed from link_active_days if no explicit deadline)
        deadline = job.application_deadline
        if not deadline and job.link_active_days and job.created_at:
            from datetime import timedelta
            deadline = job.created_at + timedelta(days=job.link_active_days)
        if deadline and datetime.utcnow() > deadline:
            return jsonify({'error': 'Application deadline has passed'}), 400

        # Check max CV uploads
        current_count = CandidateApplication.query.filter_by(job_id=job.id).count()
        if job.max_cv_uploads and current_count >= job.max_cv_uploads:
            return jsonify({'error': 'Maximum number of applications reached for this position'}), 400

        name = request.form.get('candidate_name', '').strip()
        email = request.form.get('candidate_email', '').strip()
        phone = request.form.get('candidate_phone', '').strip()

        if not name or not email:
            return jsonify({'error': 'Name and email are required'}), 400

        # Check duplicate
        existing = CandidateApplication.query.filter_by(
            job_id=job.id, candidate_email=email
        ).first()
        if existing:
            return jsonify({'error': 'You have already applied to this job'}), 409

        # Handle CV upload
        cv_path = None
        cv_text = ''
        if 'cv_file' in request.files:
            file = request.files['cv_file']
            if file and file.filename:
                fname = secure_filename(file.filename)
                upload_dir = os.path.join(current_app.config.get('UPLOAD_FOLDER', 'uploads'), 'cvs')
                os.makedirs(upload_dir, exist_ok=True)
                cv_path = os.path.join(upload_dir, f"{job.id}_{email}_{fname}")
                file.save(cv_path)
                cv_text = _extract_cv_text(cv_path)

        # Link to user account if logged in
        candidate_id = None
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            try:
                from flask_jwt_extended import decode_token
                token_data = decode_token(auth_header.split(' ')[1])
                candidate_id = token_data.get('sub')
            except Exception:
                pass  # Not logged in — that's fine

        app_record = CandidateApplication(
            job_id=job.id,
            candidate_id=candidate_id,
            candidate_name=name,
            candidate_email=email,
            candidate_phone=phone,
            cv_file_path=cv_path,
            cv_text=cv_text,
            status='applied',
            applied_at=datetime.utcnow()
        )
        db.session.add(app_record)

        # Bump application count on job
        job.total_applications = (job.total_applications or 0) + 1
        db.session.commit()

        # Send confirmation email (async-safe)
        if email_service:
            email_service.send_application_received(
                to_email=email, to_name=name,
                job_title=job.title,
                company=job.company_name or 'IntelliHire'
            )
            log = EmailLog(
                recipient_email=email, recipient_name=name,
                email_type='application_received',
                subject=f'Application Received — {job.title}',
                status='sent', related_job_id=job.id,
                related_application_id=app_record.id,
                sent_at=datetime.utcnow()
            )
            db.session.add(log)
            db.session.commit()

        # Notify interviewer
        if job.created_by:
            notif = Notification(
                user_id=job.created_by,
                title='New Application',
                message=f'{name} applied to {job.title}',
                type='application',
                link=f'/applications/{job.id}',
                related_job_id=job.id,
                related_application_id=app_record.id
            )
            db.session.add(notif)
            db.session.commit()

        logger.info(f"✅ Application received: {name} → {job.title}")
        return jsonify({
            'success': True,
            'application': app_record.to_dict(),
            'message': 'Application submitted successfully!'
        }), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"❌ Application submit failed: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


# ═══════════════════════════════════════════════════════════
#  INTERVIEWER: List applications for a job
# ═══════════════════════════════════════════════════════════
@application_bp.route('/job/<int:job_id>', methods=['GET', 'OPTIONS'])
@jwt_required()
def list_applications(job_id):
    """List all applications for a job (interviewer only)."""
    if request.method == 'OPTIONS':
        return '', 200
    user = _get_current_user()
    if not user or user.role not in ('interviewer', 'admin'):
        return jsonify({'error': 'Unauthorized'}), 403

    job = Job.query.get(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404

    status_filter = request.args.get('status')
    query = CandidateApplication.query.filter_by(job_id=job_id)
    if status_filter:
        query = query.filter_by(status=status_filter)

    from sqlalchemy import desc

    apps = query.order_by(
        CandidateApplication.ats_score.is_(None),  # push NULLs last
        desc(CandidateApplication.ats_score),
        desc(CandidateApplication.applied_at)
    ).all()

    return jsonify({
        'success': True,
        'job': {
            'id': job.id, 'title': job.title, 'max_shortlist': job.max_shortlist,
            'total_applications': job.total_applications,
            'share_token': job.share_token, 'is_published': job.is_published,
        },
        'applications': [a.to_dict() for a in apps],
        'counts': {
            'total': len(apps),
            'applied': sum(1 for a in apps if a.status == 'applied'),
            'scored': sum(1 for a in apps if a.status == 'scored'),
            'shortlisted': sum(1 for a in apps if a.status == 'shortlisted'),
            'rejected': sum(1 for a in apps if a.status == 'rejected'),
            'scheduled': sum(1 for a in apps if a.status == 'scheduled'),
            'interviewed': sum(1 for a in apps if a.status == 'interviewed'),
        }
    })


# ═══════════════════════════════════════════════════════════
#  INTERVIEWER: Trigger ATS scoring
# ═══════════════════════════════════════════════════════════
@application_bp.route('/score/<int:job_id>', methods=['POST', 'OPTIONS'])
@jwt_required()
def score_applications(job_id):
    """Score all pending applications via DeepSeek ATS."""
    if request.method == 'OPTIONS':
        return '', 200
    user = _get_current_user()
    if not user or user.role not in ('interviewer', 'admin'):
        return jsonify({'error': 'Unauthorized'}), 403

    job = Job.query.get(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404

    if not pipeline_service:
        return jsonify({'error': 'Pipeline service not available'}), 503

    results = pipeline_service.score_applications(job)
    return jsonify({
        'success': True,
        'scored': len(results),
        'message': f'Scored {len(results)} applications'
    })


# ═══════════════════════════════════════════════════════════
#  INTERVIEWER: Shortlist top N
# ═══════════════════════════════════════════════════════════
@application_bp.route('/shortlist/<int:job_id>', methods=['POST', 'OPTIONS'])
@jwt_required()
def shortlist_candidates(job_id):
    """Shortlist top N candidates, reject the rest."""
    if request.method == 'OPTIONS':
        return '', 200
    user = _get_current_user()
    if not user or user.role not in ('interviewer', 'admin'):
        return jsonify({'error': 'Unauthorized'}), 403

    job = Job.query.get(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404

    # Allow overriding max_shortlist via request body
    data = request.get_json(silent=True) or {}
    if 'max_shortlist' in data:
        job.max_shortlist = int(data['max_shortlist'])
        db.session.commit()

    if not pipeline_service:
        return jsonify({'error': 'Pipeline service not available'}), 503

    shortlisted, rejected = pipeline_service.shortlist_top_n(job)
    return jsonify({
        'success': True,
        'shortlisted': len(shortlisted),
        'rejected': len(rejected),
        'shortlisted_ids': shortlisted,
        'rejected_ids': rejected,
    })


# ═══════════════════════════════════════════════════════════
#  INTERVIEWER: Schedule interviews for shortlisted
# ═══════════════════════════════════════════════════════════
@application_bp.route('/schedule/<int:job_id>', methods=['POST', 'OPTIONS'])
@jwt_required()
def schedule_interviews(job_id):
    """Create interviews + schedules + send emails for shortlisted candidates."""
    if request.method == 'OPTIONS':
        return '', 200
    user = _get_current_user()
    if not user or user.role not in ('interviewer', 'admin'):
        return jsonify({'error': 'Unauthorized'}), 403

    job = Job.query.get(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404

    if not pipeline_service:
        return jsonify({'error': 'Pipeline service not available'}), 503

    data = request.get_json(silent=True) or {}
    start_time = None
    if 'start_time' in data:
        start_time = datetime.fromisoformat(data['start_time'])
    gap = int(data.get('gap_minutes', 45))

    schedules = pipeline_service.schedule_interviews(job, start_time=start_time, gap_minutes=gap)
    return jsonify({
        'success': True,
        'interviews_scheduled': len(schedules),
        'schedules': schedules,
    })


# ═══════════════════════════════════════════════════════════
#  INTERVIEWER: Run full pipeline (score → shortlist → schedule)
# ═══════════════════════════════════════════════════════════
@application_bp.route('/pipeline/<int:job_id>', methods=['POST', 'OPTIONS'])
@jwt_required()
def run_pipeline(job_id):
    """Run the entire pipeline for a job."""
    if request.method == 'OPTIONS':
        return '', 200
    user = _get_current_user()
    if not user or user.role not in ('interviewer', 'admin'):
        return jsonify({'error': 'Unauthorized'}), 403

    job = Job.query.get(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404

    if not pipeline_service:
        return jsonify({'error': 'Pipeline service not available'}), 503

    result = pipeline_service.run_full_pipeline(job)
    return jsonify({'success': True, **result})


# ═══════════════════════════════════════════════════════════
#  INTERVIEWER: Publish / unpublish job
# ═══════════════════════════════════════════════════════════
@application_bp.route('/publish/<int:job_id>', methods=['POST', 'OPTIONS'])
@jwt_required()
def toggle_publish(job_id):
    """Publish or unpublish a job. Returns the share link."""
    if request.method == 'OPTIONS':
        return '', 200
    user = _get_current_user()
    if not user or user.role not in ('interviewer', 'admin'):
        return jsonify({'error': 'Unauthorized'}), 403

    job = Job.query.get(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404

    data = request.get_json(silent=True) or {}
    job.is_published = data.get('publish', not job.is_published)

    # Ensure share token exists
    if not job.share_token:
        import uuid as _uuid
        job.share_token = _uuid.uuid4().hex

    # Update optional fields
    if 'max_shortlist' in data:
        job.max_shortlist = int(data['max_shortlist'])
    if 'application_deadline' in data and data['application_deadline']:
        job.application_deadline = datetime.fromisoformat(data['application_deadline'])
    if 'company_name' in data:
        job.company_name = data['company_name']
    if 'location' in data:
        job.location = data['location']
    if 'job_type' in data:
        job.job_type = data['job_type']
    if 'salary_range' in data:
        job.salary_range = data['salary_range']

    db.session.commit()

    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
    share_link = f"{frontend_url}/apply/{job.share_token}"

    return jsonify({
        'success': True,
        'is_published': job.is_published,
        'share_token': job.share_token,
        'share_link': share_link,
        'job': job.to_dict(),
    })


# ═══════════════════════════════════════════════════════════
#  CANDIDATE: My applications
# ═══════════════════════════════════════════════════════════
@application_bp.route('/my', methods=['GET', 'OPTIONS'])
@jwt_required()
def my_applications():
    """Candidate's own applications."""
    if request.method == 'OPTIONS':
        return '', 200
    uid = get_jwt_identity()
    apps = CandidateApplication.query.filter_by(candidate_id=uid).order_by(
        CandidateApplication.applied_at.desc()
    ).all()
    result = []
    for a in apps:
        d = a.to_dict()
        d['job_title'] = a.job.title if a.job else 'Unknown'
        d['company_name'] = a.job.company_name if a.job else None
        result.append(d)
    return jsonify({'success': True, 'applications': result})


# ═══════════════════════════════════════════════════════════
#  INTERVIEWER: Notifications
# ═══════════════════════════════════════════════════════════
@application_bp.route('/notifications', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_notifications():
    """Get user's notifications."""
    if request.method == 'OPTIONS':
        return '', 200
    uid = get_jwt_identity()
    notifs = Notification.query.filter_by(user_id=uid).order_by(
        Notification.created_at.desc()
    ).limit(50).all()
    unread = sum(1 for n in notifs if not n.is_read)
    return jsonify({
        'success': True,
        'notifications': [n.to_dict() for n in notifs],
        'unread_count': unread
    })


@application_bp.route('/notifications/read', methods=['POST', 'OPTIONS'])
@jwt_required()
def mark_notifications_read():
    """Mark notifications as read."""
    if request.method == 'OPTIONS':
        return '', 200
    uid = get_jwt_identity()
    data = request.get_json(silent=True) or {}
    ids = data.get('ids', [])
    if ids:
        Notification.query.filter(
            Notification.id.in_(ids), Notification.user_id == uid
        ).update({'is_read': True}, synchronize_session=False)
    else:
        # mark all as read
        Notification.query.filter_by(user_id=uid, is_read=False).update(
            {'is_read': True}, synchronize_session=False
        )
    db.session.commit()
    return jsonify({'success': True})


# ═══════════════════════════════════════════════════════════
#  INTERVIEWER: Email logs
# ═══════════════════════════════════════════════════════════
@application_bp.route('/emails/<int:job_id>', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_email_logs(job_id):
    """Get email logs for a job."""
    if request.method == 'OPTIONS':
        return '', 200
    logs = EmailLog.query.filter_by(related_job_id=job_id).order_by(
        EmailLog.created_at.desc()
    ).all()
    return jsonify({'success': True, 'emails': [l.to_dict() for l in logs]})


# ═══════════════════════════════════════════════════════════
#  PUBLIC: Available interview slots for a candidate
# ═══════════════════════════════════════════════════════════
@application_bp.route('/slots/<int:application_id>', methods=['GET', 'OPTIONS'])
def get_available_slots(application_id):
    """Return available 30-min slots for candidate self-scheduling.

    Slots are generated within the scheduling window for the job,
    excluding times where max_concurrent_interviews are already booked.
    """
    if request.method == 'OPTIONS':
        return '', 200

    app_record = CandidateApplication.query.get(application_id)
    if not app_record:
        return jsonify({'error': 'Application not found'}), 404
    if app_record.status not in ('shortlisted', 'scheduled'):
        return jsonify({'error': 'Not eligible for scheduling'}), 403

    job = Job.query.get(app_record.job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404

    from datetime import timedelta
    duration = job.duration_minutes or 30
    max_concurrent = job.max_concurrent_interviews or 3
    window_days = job.scheduling_window_days or 7

    # Slot generation window: tomorrow 9am  →  + window_days, 6pm
    now = datetime.utcnow()
    start_date = (now + timedelta(days=1)).replace(hour=9, minute=0, second=0, microsecond=0)
    end_date = start_date + timedelta(days=window_days)

    # Existing bookings (non-cancelled)
    booked = InterviewSchedule.query.join(Interview).filter(
        Interview.job_id == job.id,
        InterviewSchedule.status.notin_(['cancelled', 'no_show']),
    ).all()

    booked_times = [(b.scheduled_at, b.scheduled_at + timedelta(minutes=b.duration_minutes or duration)) for b in booked]

    # Generate 30-min slots from 9am–6pm each day
    slots = []
    slot_time = start_date
    while slot_time < end_date:
        # Working hours only (9am – 6pm UTC)
        if slot_time.hour < 9 or slot_time.hour >= 18:
            slot_time = (slot_time + timedelta(days=1)).replace(hour=9, minute=0)
            continue

        slot_end = slot_time + timedelta(minutes=duration)

        # Count concurrent interviews at this time
        concurrent = sum(
            1 for (bs, be) in booked_times
            if bs < slot_end and be > slot_time
        )

        if concurrent < max_concurrent:
            slots.append({
                'start': slot_time.isoformat(),
                'end': slot_end.isoformat(),
                'available': True,
            })

        slot_time += timedelta(minutes=30)

    return jsonify({'success': True, 'slots': slots, 'duration_minutes': duration})


# ═══════════════════════════════════════════════════════════
#  PUBLIC: Candidate self-schedules interview
# ═══════════════════════════════════════════════════════════
@application_bp.route('/book-slot', methods=['POST', 'OPTIONS'])
def book_interview_slot():
    """Candidate picks a slot. Creates Interview + InterviewSchedule."""
    if request.method == 'OPTIONS':
        return '', 200
    try:
        data = request.get_json(silent=True) or {}
        application_id = data.get('application_id')
        slot_start = data.get('slot_start')
        if not application_id or not slot_start:
            return jsonify({'error': 'application_id and slot_start required'}), 400

        app_record = CandidateApplication.query.get(application_id)
        if not app_record:
            return jsonify({'error': 'Application not found'}), 404
        if app_record.status not in ('shortlisted',):
            return jsonify({'error': 'Not eligible for scheduling'}), 403

        job = Job.query.get(app_record.job_id)
        slot_dt = datetime.fromisoformat(slot_start)
        duration = job.duration_minutes or 30
        from datetime import timedelta
        max_concurrent = job.max_concurrent_interviews or 3

        # Verify slot is still available (concurrency check)
        slot_end = slot_dt + timedelta(minutes=duration)
        concurrent = InterviewSchedule.query.join(Interview).filter(
            Interview.job_id == job.id,
            InterviewSchedule.status.notin_(['cancelled', 'no_show']),
            InterviewSchedule.scheduled_at < slot_end,
            db.func.datetime(InterviewSchedule.scheduled_at, f'+{duration} minutes') > slot_dt,
        ).count()
        if concurrent >= max_concurrent:
            return jsonify({'error': 'This slot is no longer available. Please choose another.'}), 409

        # Create Interview record
        interview = Interview(
            job_id=job.id,
            application_id=app_record.id,
            candidate_name=app_record.candidate_name,
            candidate_email=app_record.candidate_email,
            candidate_phone=app_record.candidate_phone,
            cv_file_path=app_record.cv_file_path,
            status='pending',
        )
        db.session.add(interview)
        db.session.flush()

        frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
        meeting_link = f"{frontend_url}/interview/{job.id}?iid={interview.id}"

        schedule = InterviewSchedule(
            interview_id=interview.id,
            application_id=app_record.id,
            scheduled_at=slot_dt,
            duration_minutes=duration,
            meeting_link=meeting_link,
            status='scheduled',
            invitation_sent_at=datetime.utcnow(),
        )
        db.session.add(schedule)
        app_record.status = 'scheduled'
        db.session.commit()

        # Send confirmation email
        scheduled_str = slot_dt.strftime('%B %d, %Y at %I:%M %p UTC')
        if email_service:
            email_service.send_shortlisted(
                to_email=app_record.candidate_email,
                to_name=app_record.candidate_name,
                job_title=job.title,
                interview_link=meeting_link,
                scheduled_at=scheduled_str,
            )

        logger.info(f"✅ Candidate {app_record.candidate_email} booked slot {slot_dt} for job {job.id}")
        return jsonify({
            'success': True,
            'schedule': schedule.to_dict(),
            'meeting_link': meeting_link,
        }), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"❌ Slot booking failed: {e}")
        import traceback; traceback.print_exc()
        return jsonify({'error': str(e)}), 500


# ═══════════════════════════════════════════════════════════
#  PUBLIC: Candidate reschedules (max 1 time)
# ═══════════════════════════════════════════════════════════
@application_bp.route('/reschedule', methods=['POST', 'OPTIONS'])
def reschedule_interview():
    """Reschedule an interview. Allowed only once."""
    if request.method == 'OPTIONS':
        return '', 200
    try:
        data = request.get_json(silent=True) or {}
        schedule_id = data.get('schedule_id')
        new_slot = data.get('new_slot_start')
        if not schedule_id or not new_slot:
            return jsonify({'error': 'schedule_id and new_slot_start required'}), 400

        schedule = InterviewSchedule.query.get(schedule_id)
        if not schedule:
            return jsonify({'error': 'Schedule not found'}), 404
        if schedule.status not in ('scheduled', 'reminded'):
            return jsonify({'error': 'Cannot reschedule — interview already started or completed'}), 400
        if (schedule.reschedule_count or 0) >= 1:
            return jsonify({'error': 'Reschedule limit reached. Each candidate can reschedule only once.'}), 403

        new_dt = datetime.fromisoformat(new_slot)
        job = Job.query.get(schedule.application.job_id)
        duration = job.duration_minutes or 30
        from datetime import timedelta
        max_concurrent = job.max_concurrent_interviews or 3

        # Verify new slot availability
        slot_end = new_dt + timedelta(minutes=duration)
        concurrent = InterviewSchedule.query.join(Interview).filter(
            Interview.job_id == job.id,
            InterviewSchedule.id != schedule.id,
            InterviewSchedule.status.notin_(['cancelled', 'no_show']),
            InterviewSchedule.scheduled_at < slot_end,
            db.func.datetime(InterviewSchedule.scheduled_at, f'+{duration} minutes') > new_dt,
        ).count()
        if concurrent >= max_concurrent:
            return jsonify({'error': 'New slot not available. Please choose another.'}), 409

        old_time = schedule.scheduled_at
        schedule.scheduled_at = new_dt
        schedule.reschedule_count = (schedule.reschedule_count or 0) + 1
        schedule.status = 'scheduled'
        schedule.updated_at = datetime.utcnow()
        db.session.commit()

        # Send reschedule confirmation
        if email_service:
            scheduled_str = new_dt.strftime('%B %d, %Y at %I:%M %p UTC')
            email_service.send_interview_reminder(
                to_email=schedule.application.candidate_email,
                to_name=schedule.application.candidate_name,
                job_title=job.title,
                interview_link=schedule.meeting_link,
                scheduled_at=f"Rescheduled to {scheduled_str}",
            )

        logger.info(f"✅ Interview rescheduled: {old_time} → {new_dt}")
        return jsonify({'success': True, 'schedule': schedule.to_dict()})

    except Exception as e:
        db.session.rollback()
        logger.error(f"❌ Reschedule failed: {e}")
        return jsonify({'error': str(e)}), 500


# ═══════════════════════════════════════════════════════════
#  PUBLIC: Get schedule info by application (for candidate portal)
# ═══════════════════════════════════════════════════════════
@application_bp.route('/my-schedule/<int:application_id>', methods=['GET', 'OPTIONS'])
def get_my_schedule(application_id):
    """Return schedule details for a candidate's application."""
    if request.method == 'OPTIONS':
        return '', 200
    app_record = CandidateApplication.query.get(application_id)
    if not app_record:
        return jsonify({'error': 'Application not found'}), 404
    schedule = InterviewSchedule.query.filter_by(application_id=application_id).first()
    if not schedule:
        return jsonify({'success': True, 'schedule': None})
    return jsonify({'success': True, 'schedule': schedule.to_dict()})


# ═══════════════════════════════════════════════════════════
#  CRON/MANUAL: Send reminders & interview links
# ═══════════════════════════════════════════════════════════
@application_bp.route('/send-reminders', methods=['POST', 'OPTIONS'])
def send_interview_reminders():
    """Send 1-hour reminder emails and interview-link emails.
    Should be called periodically (e.g. every 5 minutes via cron/scheduler).
    """
    if request.method == 'OPTIONS':
        return '', 200

    from datetime import timedelta
    now = datetime.utcnow()
    sent = {'reminders': 0, 'links': 0}

    # 1-hour reminders
    one_hour_ahead = now + timedelta(hours=1)
    remind_schedules = InterviewSchedule.query.filter(
        InterviewSchedule.status == 'scheduled',
        InterviewSchedule.reminder_sent_at.is_(None),
        InterviewSchedule.scheduled_at <= one_hour_ahead,
        InterviewSchedule.scheduled_at > now,
    ).all()

    for s in remind_schedules:
        job = Job.query.get(s.interview.job_id) if s.interview else None
        if email_service and job:
            scheduled_str = s.scheduled_at.strftime('%B %d, %Y at %I:%M %p UTC')
            email_service.send_interview_reminder(
                to_email=s.application.candidate_email,
                to_name=s.application.candidate_name,
                job_title=job.title,
                interview_link=s.meeting_link,
                scheduled_at=scheduled_str,
            )
            s.reminder_sent_at = datetime.utcnow()
            s.status = 'reminded'
            sent['reminders'] += 1

    # Interview links — send when within 5 minutes of start
    five_min_ahead = now + timedelta(minutes=5)
    link_schedules = InterviewSchedule.query.filter(
        InterviewSchedule.status.in_(['scheduled', 'reminded']),
        InterviewSchedule.scheduled_at <= five_min_ahead,
        InterviewSchedule.scheduled_at > now - timedelta(minutes=5),
    ).all()

    for s in link_schedules:
        job = Job.query.get(s.interview.job_id) if s.interview else None
        if email_service and job and s.status != 'in_progress':
            email_service.send_interview_link(
                to_email=s.application.candidate_email,
                to_name=s.application.candidate_name,
                job_title=job.title,
                interview_link=s.meeting_link,
            )
            s.status = 'in_progress'
            sent['links'] += 1

    db.session.commit()
    return jsonify({'success': True, 'sent': sent})
