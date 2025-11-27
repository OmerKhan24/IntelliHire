from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
import logging
import asyncio
import os
import uuid
from werkzeug.utils import secure_filename

from models.models import db, Job, Interview, Question, Response, User
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, get_jwt
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


def role_required(role):
    """Simple decorator to enforce role-based access"""
    def wrapper(fn):
        @jwt_required()
        def decorated(*args, **kwargs):
            identity = get_jwt_identity()
            logger.info(f"🔐 role_required check - identity: {identity}, required_role: {role}")
            if not identity:
                logger.warning("⚠️ No identity found in JWT")
                return jsonify({'error': 'Unauthorized'}), 401
            user = User.query.filter_by(id=int(identity)).first()
            if not user:
                logger.warning(f"⚠️ User not found for identity: {identity}")
                return jsonify({'error': 'User not found'}), 403
            if user.role != role:
                logger.warning(f"⚠️ Role mismatch - user has '{user.role}', required '{role}'")
                return jsonify({'error': 'Forbidden - insufficient role'}), 403
            logger.info(f"✅ Role check passed for user: {user.username}")
            return fn(*args, **kwargs)
        # preserve function attributes
        decorated.__name__ = fn.__name__
        return decorated
    return wrapper


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
@job_bp.route('/', methods=['GET', 'OPTIONS'], strict_slashes=False)
@job_bp.route('', methods=['GET', 'OPTIONS'], strict_slashes=False)
def handle_jobs():
    """Handle job operations - list (GET)"""
    if request.method == 'OPTIONS':
        return '', 204
    return list_jobs()


@job_bp.route('/', methods=['POST', 'OPTIONS'], strict_slashes=False)
@role_required('interviewer')
def create_job_route():
    """Protected route to create a new job posting (interviewer only)"""
    if request.method == 'OPTIONS':
        return '', 204
    logger.info(f"🔑 Authorization header: {request.headers.get('Authorization', 'MISSING')}")
    return create_job()


def create_job():
    """Create a new job posting"""
    try:
        data = request.get_json()
        logger.info(f"📝 Received job creation data: {data}")
        
        if not data or not data.get('title') or not data.get('description'):
            logger.warning(f"⚠️ Missing required fields: title={data.get('title')}, description={data.get('description')}")
            return jsonify({'error': 'Title and description are required'}), 400

        # Convert scoring_criteria to JSON string if it's a dict
        scoring_criteria = data.get('scoring_criteria', {})
        if isinstance(scoring_criteria, dict):
            import json
            scoring_criteria = json.dumps(scoring_criteria)

        job = Job(
            title=data['title'],
            description=data['description'],
            requirements=data.get('requirements', ''),
            duration_minutes=data.get('duration_minutes', 20),
            created_by=data.get('created_by', 'HR'),
            scoring_criteria=scoring_criteria
        )
        db.session.add(job)
        db.session.commit()

        logger.info(f"✅ Job created: {job.title}")
        return jsonify({'success': True, 'job': job.to_dict()}), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"❌ Failed to create job: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


# =============== AUTH ROUTES ===============
@api_bp.route('/auth/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        return '', 204
    try:
        data = request.get_json() or {}
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role', 'candidate')
        if not username or not email or not password:
            return jsonify({'error': 'username, email and password are required'}), 400
        if User.query.filter((User.username == username) | (User.email == email)).first():
            return jsonify({'error': 'User with this username or email already exists'}), 400
        user = User(username=username, email=email, role=role)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        return jsonify({'success': True, 'user': user.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"❌ Failed to register user: {e}")
        return jsonify({'error': str(e)}), 500


@api_bp.route('/auth/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 204
    try:
        data = request.get_json() or {}
        username = data.get('username')
        password = data.get('password')
        if not username or not password:
            return jsonify({'error': 'username and password required'}), 400
        user = User.query.filter((User.username == username) | (User.email == username)).first()
        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid credentials'}), 401
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        return jsonify({'access_token': access_token, 'refresh_token': refresh_token, 'user': user.to_dict()})
    except Exception as e:
        logger.error(f"❌ Login failed: {e}")
        return jsonify({'error': str(e)}), 500


@api_bp.route('/auth/me', methods=['GET', 'OPTIONS'])
@jwt_required()
def me():
    if request.method == 'OPTIONS':
        return '', 204
    identity = get_jwt_identity()
    user = User.query.get(identity)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'user': user.to_dict()})


@api_bp.route('/auth/refresh', methods=['POST', 'OPTIONS'])
@jwt_required(refresh=True)
def refresh():
    if request.method == 'OPTIONS':
        return '', 204
    identity = get_jwt_identity()
    access_token = create_access_token(identity=str(identity))
    return jsonify({'access_token': access_token})


@api_bp.route('/auth/logout', methods=['POST', 'OPTIONS'])
@jwt_required()
def logout():
    if request.method == 'OPTIONS':
        return '', 204
    # In production, you'd add token to a blacklist/revoked tokens table
    return jsonify({'message': 'Logged out successfully'})


# =============== CANDIDATE ENDPOINTS ===============
@api_bp.route('/candidate/upload_cv', methods=['POST', 'OPTIONS'])
def upload_cv_public():
    """Public endpoint for CV upload during interview (no auth required)"""
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        logger.info(f"📤 CV Upload request - Files: {list(request.files.keys())}, Form: {dict(request.form)}")
        
        # Check for both 'file' and 'cv' (frontend might send either)
        file = request.files.get('file') or request.files.get('cv')
        
        if not file:
            logger.error("❌ No 'file' or 'cv' in request.files")
            return jsonify({'error': 'No file provided'}), 400
        
        if file.filename == '':
            logger.error("❌ Empty filename")
            return jsonify({'error': 'No file selected'}), 400
        
        # Get interview_id from form data
        interview_id = request.form.get('interview_id')
        logger.info(f"📝 Interview ID from form: {interview_id}")
        
        if not interview_id:
            logger.error("❌ No interview_id in form data")
            return jsonify({'error': 'interview_id required'}), 400
        
        # Validate file extension
        allowed_extensions = {'pdf', 'doc', 'docx'}
        file_ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
        if file_ext not in allowed_extensions:
            logger.error(f"❌ Invalid file extension: {file_ext}")
            return jsonify({'error': 'Invalid file type. Only PDF, DOC, DOCX allowed'}), 400
        
        # Create uploads directory if not exists
        upload_folder = os.path.join(os.path.dirname(__file__), '..', 'uploads', 'cvs')
        os.makedirs(upload_folder, exist_ok=True)
        
        # Generate unique filename
        unique_filename = f"{interview_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{secure_filename(file.filename)}"
        file_path = os.path.join(upload_folder, unique_filename)
        
        # Save file
        file.save(file_path)
        logger.info(f"💾 File saved to: {file_path}")
        
        # Update interview record with CV path
        interview = Interview.query.get(interview_id)
        if interview:
            interview.cv_file_path = file_path
            db.session.commit()
            logger.info(f"✅ CV uploaded for interview {interview_id}: {unique_filename}")
        else:
            logger.warning(f"⚠️ Interview {interview_id} not found in database")
        
        return jsonify({
            'success': True, 
            'cv_path': file_path,
            'filename': unique_filename
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"❌ CV upload failed: {e}")
        import traceback
        traceback.print_exc()
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

        # Generate AI-powered questions using Gemini with RAG
        job = Job.query.get(interview.job_id)
        
        # Extract CV text for RAG if available
        cv_text = None
        if interview.cv_file_path:
            try:
                from utils.cv_parser import extract_text_from_cv
                cv_text = extract_text_from_cv(interview.cv_file_path)
                if cv_text:
                    logger.info(f"✅ Extracted {len(cv_text)} chars from CV for RAG")
                else:
                    logger.warning("⚠️ CV file exists but text extraction failed")
            except Exception as e:
                logger.error(f"❌ CV parsing error: {e}")
        
        if gemini_service and gemini_service.enabled:
            try:
                # Use asyncio to run the async function
                import asyncio
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                ai_questions = loop.run_until_complete(
                    gemini_service.generate_questions(
                        job.description,
                        job.requirements or "General qualifications",
                        num_questions=5,
                        cv_text=cv_text  # RAG context from CV
                    )
                )
                loop.close()
                
                logger.info(f"✅ AI-generated {len(ai_questions)} questions using Gemini")
                
                # Create Question objects from AI responses
                for idx, q_text in enumerate(ai_questions):
                    db.session.add(Question(
                        interview_id=interview_id,
                        question=q_text,
                        question_type='ai_generated',
                        order_index=idx + 1
                    ))
                    
            except Exception as e:
                logger.warning(f"⚠️ AI question generation failed: {e}, using fallback")
                # Fallback to default questions
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
        else:
            # No AI service - use default questions
            logger.info("⚠️ Gemini not available, using default questions")
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

        # Fetch the newly created questions with IDs
        created_questions = Question.query.filter_by(interview_id=interview_id).all()
        return jsonify({'questions': [q.to_dict() for q in created_questions]})

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


@interview_bp.route('/upload_audio', methods=['POST', 'OPTIONS'])
def upload_audio():
    """Upload and analyze audio recording of candidate's answer"""
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        logger.info(f"📤 Audio upload request - Files: {list(request.files.keys())}, Form: {dict(request.form)}")
        
        # Get audio file
        audio_file = request.files.get('audio')
        if not audio_file:
            return jsonify({'error': 'No audio file provided'}), 400
        
        # Get response_id
        response_id = request.form.get('response_id')
        if not response_id:
            return jsonify({'error': 'response_id required'}), 400
        
        # Create uploads directory
        upload_folder = os.path.join(os.path.dirname(__file__), '..', 'uploads', 'audio')
        os.makedirs(upload_folder, exist_ok=True)
        
        # Generate unique filename
        unique_filename = f"response_{response_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.webm"
        audio_path = os.path.join(upload_folder, unique_filename)
        
        # Save audio file
        audio_file.save(audio_path)
        logger.info(f"💾 Audio saved: {audio_path}")
        
        # Analyze voice
        try:
            from services.voice_analysis_service import voice_analysis_service
            voice_analysis = voice_analysis_service.analyze_audio_file(audio_path)
            logger.info(f"🎤 Voice analysis: {voice_analysis.get('word_count')} words, {voice_analysis.get('speaking_pace')} WPM")
        except Exception as analysis_err:
            logger.error(f"⚠️ Voice analysis failed: {analysis_err}")
            voice_analysis = {'error': str(analysis_err)}
        
        # Update response record
        response = Response.query.get(response_id)
        if response:
            response.answer_audio_url = audio_path
            response.voice_analysis_data = voice_analysis
            
            # Update communication score based on voice analysis
            if not voice_analysis.get('error'):
                # Blend existing score with voice analysis scores
                voice_confidence = voice_analysis.get('confidence_score', 0)
                voice_clarity = voice_analysis.get('clarity_score', 0)
                
                if response.communication_score:
                    # Average with existing score
                    response.communication_score = round(
                        (response.communication_score + voice_confidence + voice_clarity) / 3, 2
                    )
                else:
                    response.communication_score = round((voice_confidence + voice_clarity) / 2, 2)
            
            db.session.commit()
            logger.info(f"✅ Audio analysis saved for response {response_id}")
        
        return jsonify({
            'success': True,
            'audio_url': audio_path,
            'voice_analysis': voice_analysis
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"❌ Audio upload failed: {e}")
        import traceback
        traceback.print_exc()
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

        # Calculate average scores
        total_confidence = sum([r.confidence_score or 0 for r in responses])
        total_relevance = sum([r.relevance_score or 0 for r in responses])
        total_technical = sum([r.technical_score or 0 for r in responses])
        total_communication = sum([r.communication_score or 0 for r in responses])
        
        num_responses = len(responses)
        avg_confidence = round(total_confidence / num_responses, 2)
        avg_relevance = round(total_relevance / num_responses, 2)
        avg_technical = round(total_technical / num_responses, 2)
        avg_communication = round(total_communication / num_responses, 2)
        
        avg_score = round((avg_confidence + avg_relevance + avg_technical + avg_communication) / 4, 2)

        # Generate AI analysis
        ai_analysis = {
            'overall_assessment': f'{interview.candidate_name} completed the interview with {num_responses} responses.',
            'strengths': [
                'Completed all interview questions',
                'Provided detailed responses' if any(len(r.answer_text or '') > 100 for r in responses) else 'Provided responses to all questions'
            ],
            'weaknesses': [
                'Could provide more detailed answers' if all(len(r.answer_text or '') < 100 for r in responses) else 'Continue developing technical skills'
            ],
            'recommendation': 'Recommended for next round' if avg_score >= 70 else 'Consider for future opportunities',
            'scores': {
                'confidence': avg_confidence,
                'relevance': avg_relevance,
                'technical': avg_technical,
                'communication': avg_communication
            }
        }

        interview.final_score = avg_score
        interview.status = 'completed'
        interview.completed_at = datetime.now()
        interview.ai_analysis = ai_analysis
        db.session.commit()

        logger.info(f"✅ Interview completed: {interview_id} with score {avg_score}")
        return jsonify({'success': True, 'final_score': interview.final_score, 'ai_analysis': ai_analysis}), 200

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


@report_bp.route('/job/<int:job_id>', methods=['GET', 'OPTIONS'])
def get_job_report(job_id):
    """Get all interviews summary for a job"""
    if request.method == 'OPTIONS':
        return '', 200
        
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
