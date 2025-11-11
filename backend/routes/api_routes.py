from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
import logging
import asyncio
import os
import uuid

from models.models import db, Job, Interview, Question, Response
from services.gemini_service import GeminiService

# Initialize logger
logger = logging.getLogger(__name__)

# Initialize Gemini service (optional)
gemini_service = None


def init_services(config):
    """Initialize external AI services (Gemini, etc.)"""
    global gemini_service
    try:
        gemini_service = GeminiService()
        logger.info("✅ Gemini AI service initialized successfully")
    except Exception as e:
        logger.warning(f"⚠️ Gemini service not available: {e}")


# =============== BLUEPRINT SETUP ===============
api_bp = Blueprint('api', __name__, url_prefix='/api')
job_bp = Blueprint('jobs', __name__, url_prefix='/api/jobs')
interview_bp = Blueprint('interviews', __name__, url_prefix='/api/interviews')
report_bp = Blueprint('reports', __name__, url_prefix='/api/reports')


def register_blueprints(app):
    """Register all blueprints with the Flask app"""
    app.register_blueprint(api_bp)
    app.register_blueprint(job_bp)
    app.register_blueprint(interview_bp)
    app.register_blueprint(report_bp)
    logger.info("✅ API blueprints registered")


# =============== HEALTH CHECK ===============
@api_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'IntelliHire API is running',
        'timestamp': datetime.now().isoformat(),
        'gemini_ai': gemini_service is not None
    })


# =============== JOB ROUTES ===============
@job_bp.route('/', methods=['GET', 'POST', 'OPTIONS'], strict_slashes=False)
@job_bp.route('', methods=['GET', 'POST', 'OPTIONS'], strict_slashes=False)
def handle_jobs():
    """Handle job operations - list or create"""
    if request.method == 'OPTIONS':
        return '', 204
    
    if request.method == 'POST':
        return create_job()
    else:
        return list_jobs()


def create_job():
    """Create a new job posting"""
    try:
        data = request.get_json()
        if not data or not data.get('title') or not data.get('description'):
            return jsonify({'error': 'Title and description are required'}), 400

        job = Job(
            title=data['title'],
            description=data['description'],
            requirements=data.get('requirements', ''),
            duration_minutes=data.get('duration_minutes', 20),
            created_by=data.get('created_by', 'HR'),
            scoring_criteria=data.get('scoring_criteria', {})
        )
        db.session.add(job)
        db.session.commit()

        logger.info(f"✅ Job created: {job.title}")
        return jsonify({'success': True, 'job': job.to_dict()}), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"❌ Failed to create job: {e}")
        return jsonify({'error': str(e)}), 500


def list_jobs():
    """List all active jobs"""
    try:
        jobs = Job.query.filter_by(status='active').order_by(Job.created_at.desc()).all()
        return jsonify({'jobs': [job.to_dict() for job in jobs]})
    except Exception as e:
        logger.error(f"❌ Failed to list jobs: {e}")
        return jsonify({'error': str(e)}), 500


@job_bp.route('/<int:job_id>', methods=['GET'])
def get_job(job_id):
    """Get details for a specific job"""
    try:
        job = Job.query.get(job_id)
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        return jsonify({'job': job.to_dict()})
    except Exception as e:
        logger.error(f"❌ Failed to get job: {e}")
        return jsonify({'error': str(e)}), 500


# =============== INTERVIEW ROUTES ===============
@interview_bp.route('/start', methods=['POST'])
def start_interview():
    """Start a new interview session"""
    try:
        data = request.get_json()
        if not data or not data.get('job_id'):
            return jsonify({'error': 'job_id is required'}), 400

        job = Job.query.get(data['job_id'])
        if not job:
            return jsonify({'error': 'Job not found'}), 404

        interview = Interview(
            job_id=job.id,
            candidate_name=data.get('candidate_name', 'Anonymous'),
            candidate_email=data.get('candidate_email', ''),
            candidate_phone=data.get('candidate_phone', ''),
            status='in_progress',
            started_at=datetime.now()
        )
        db.session.add(interview)
        db.session.commit()

        logger.info(f"✅ Interview started: {interview.id}")
        return jsonify({'success': True, 'interview': interview.to_dict()}), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"❌ Failed to start interview: {e}")
        return jsonify({'error': str(e)}), 500


@interview_bp.route('/<int:interview_id>/questions', methods=['GET'])
def get_questions(interview_id):
    """Get or generate interview questions"""
    try:
        interview = Interview.query.get(interview_id)
        if not interview:
            return jsonify({'error': 'Interview not found'}), 404

        existing = Question.query.filter_by(interview_id=interview_id).all()
        if existing:
            return jsonify({'questions': [q.to_dict() for q in existing]})

        # Generate default questions if none exist
        job = Job.query.get(interview.job_id)
        default_questions = [
            {'question': f"Tell me about yourself and why you're interested in {job.title}.", 'type': 'intro'},
            {'question': f"What experience do you have relevant to {job.title}?", 'type': 'experience'},
            {'question': "Describe a challenge you faced at work and how you handled it.", 'type': 'behavioral'}
        ]

        for idx, q in enumerate(default_questions):
            db.session.add(Question(
                interview_id=interview_id,
                question=q['question'],
                question_type=q['type'],
                order_index=idx + 1
            ))
        db.session.commit()

        logger.info(f"✅ Default questions generated for interview {interview_id}")
        return jsonify({'questions': default_questions})

    except Exception as e:
        db.session.rollback()
        logger.error(f"❌ Failed to get questions: {e}")
        return jsonify({'error': str(e)}), 500


@interview_bp.route('/<int:interview_id>/response', methods=['POST'])
def submit_response(interview_id):
    """Submit an interview response"""
    try:
        data = request.get_json()
        if not data or not data.get('question_id'):
            return jsonify({'error': 'question_id is required'}), 400

        response = Response(
            interview_id=interview_id,
            question_id=data['question_id'],
            answer_text=data.get('answer_text', ''),
            answer_duration=data.get('answer_duration', 0),
            confidence_score=75,
            relevance_score=75,
            technical_score=70,
            communication_score=75
        )
        db.session.add(response)
        db.session.commit()

        logger.info(f"✅ Response submitted for interview {interview_id}")
        return jsonify({'success': True, 'response': response.to_dict()}), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"❌ Failed to submit response: {e}")
        return jsonify({'error': str(e)}), 500


@interview_bp.route('/<int:interview_id>/complete', methods=['POST'])
def complete_interview(interview_id):
    """Mark interview as completed and compute final score"""
    try:
        interview = Interview.query.get(interview_id)
        if not interview:
            return jsonify({'error': 'Interview not found'}), 404

        responses = Response.query.filter_by(interview_id=interview_id).all()
        if not responses:
            return jsonify({'error': 'No responses found'}), 400

        avg_score = sum([
            (r.confidence_score or 0) + (r.relevance_score or 0) +
            (r.technical_score or 0) + (r.communication_score or 0)
            for r in responses
        ]) / (len(responses) * 4)

        interview.final_score = round(avg_score, 2)
        interview.status = 'completed'
        interview.completed_at = datetime.now()
        db.session.commit()

        logger.info(f"✅ Interview completed: {interview_id}")
        return jsonify({'success': True, 'final_score': interview.final_score}), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"❌ Failed to complete interview: {e}")
        return jsonify({'error': str(e)}), 500


# =============== REPORT ROUTES ===============
@report_bp.route('/interview/<int:interview_id>', methods=['GET'])
def get_interview_report(interview_id):
    """Get a detailed report for an interview"""
    try:
        interview = Interview.query.get(interview_id)
        if not interview:
            return jsonify({'error': 'Interview not found'}), 404

        responses = Response.query.filter_by(interview_id=interview_id).all()
        return jsonify({
            'interview': interview.to_dict(),
            'responses': [r.to_dict() for r in responses]
        })
    except Exception as e:
        logger.error(f"❌ Failed to get interview report: {e}")
        return jsonify({'error': str(e)}), 500


@report_bp.route('/job/<int:job_id>', methods=['GET'])
def get_job_report(job_id):
    """Get all interviews summary for a job"""
    try:
        job = Job.query.get(job_id)
        if not job:
            return jsonify({'error': 'Job not found'}), 404

        interviews = Interview.query.filter_by(job_id=job_id).all()
        return jsonify({
            'job': job.to_dict(),
            'interviews': [i.to_dict() for i in interviews]
        })
    except Exception as e:
        logger.error(f"❌ Failed to get job report: {e}")
        return jsonify({'error': str(e)}), 500


@report_bp.route('/all', methods=['GET'])
def get_all_reports():
    """Get summary of all interviews"""
    try:
        interviews = Interview.query.order_by(Interview.created_at.desc()).limit(50).all()
        summaries = []
        for interview in interviews:
            job = Job.query.get(interview.job_id)
            summaries.append({
                'interview_id': interview.id,
                'candidate_name': interview.candidate_name,
                'job_title': job.title if job else 'Unknown',
                'status': interview.status,
                'final_score': interview.final_score,
                'started_at': interview.started_at.isoformat() if interview.started_at else None
            })
        return jsonify({'success': True, 'interviews': summaries})
    except Exception as e:
        logger.error(f"❌ Failed to get all reports: {e}")
        return jsonify({'error': str(e)}), 500
