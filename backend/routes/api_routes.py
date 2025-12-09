from flask import Blueprint, request, jsonify, current_app, send_from_directory
from datetime import datetime
import logging
import asyncio
import os
import uuid
from werkzeug.utils import secure_filename

from models.models import db, Job, Interview, Question, Response, User
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, get_jwt
from services.gemini_service import GeminiService
from services.github_copilot_service import GitHubCopilotService
from services.cv_monitoring_service import cv_monitoring_service
from routes.hr_routes import hr_blueprint, init_hr_services

# Initialize logger
logger = logging.getLogger(__name__)

# Create blueprints
api_bp = Blueprint('api', __name__, url_prefix='/api')
job_bp = Blueprint('jobs', __name__, url_prefix='/api/jobs')
interview_bp = Blueprint('interviews', __name__, url_prefix='/api/interviews')
report_bp = Blueprint('reports', __name__, url_prefix='/api/reports')
monitoring_bp = Blueprint('monitoring', __name__, url_prefix='/api/monitoring')

# Initialize AI services
gemini_service = None  # For TTS only
github_copilot_service = None  # For question generation and scoring


def init_services(config):
    """Initialize external AI services (Gemini for TTS, GitHub Copilot for Q&A)"""
    global gemini_service, github_copilot_service
    try:
        gemini_service = GeminiService()
        logger.info("✅ Google TTS service initialized successfully")
    except Exception as e:
        logger.warning(f"⚠️ Google TTS service not available: {e}")
    
    # Enable GitHub Copilot for question generation and scoring
    try:
        github_copilot_service = GitHubCopilotService()
        logger.info("✅ GitHub Copilot AI service initialized successfully")
    except Exception as e:
        logger.warning(f"⚠️ GitHub Copilot service not available: {e}")
    
    # CV Monitoring service is auto-initialized on import
    if cv_monitoring_service.enabled:
        logger.info("✅ CV Monitoring service initialized successfully")
    else:
        logger.warning("⚠️ CV Monitoring service not available (models not loaded)")
    
    # Initialize HR services (RAG + Chatbot)
    try:
        init_hr_services(config)
        logger.info("✅ HR services (RAG + Chatbot) initialized successfully")
    except Exception as e:
        logger.warning(f"⚠️ HR services not available: {e}")



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
def register_blueprints(app):
    """Register all blueprints with the Flask app"""
    app.register_blueprint(api_bp)
    app.register_blueprint(job_bp)
    app.register_blueprint(interview_bp)
    app.register_blueprint(report_bp)
    app.register_blueprint(monitoring_bp)
    app.register_blueprint(hr_blueprint)  # HR Chatbot & Document Management
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
@jwt_required()
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

        # Get current user from JWT
        current_user_id = get_jwt_identity()
        
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
            created_by=current_user_id,  # Use JWT identity
            scoring_criteria=scoring_criteria
        )
        db.session.add(job)
        db.session.commit()

        logger.info(f"✅ Job created by interviewer {current_user_id}: {job.title}")
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
    """Public registration - Candidates can register themselves"""
    if request.method == 'OPTIONS':
        return '', 204
    try:
        logger.info("📝 Registration request received")
        data = request.get_json() or {}
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        full_name = data.get('full_name')
        phone = data.get('phone')
        
        logger.info(f"📝 Validating user: {username}")
        
        if not username or not email or not password:
            return jsonify({'error': 'username, email and password are required'}), 400
        
        logger.info(f"📝 Checking if user exists: {username}")
        if User.query.filter((User.username == username) | (User.email == email)).first():
            return jsonify({'error': 'User with this username or email already exists'}), 400
        
        # Public registration creates candidate accounts only
        role = 'candidate'
        logger.info(f"👤 Creating new candidate: {username}")
        
        user = User(
            username=username, 
            email=email, 
            role=role, 
            full_name=full_name,
            phone=phone,
            is_active=True
        )
        logger.info(f"🔐 Hashing password for: {username}")
        user.set_password(password)
        
        logger.info(f"💾 Saving user to database: {username}")
        db.session.add(user)
        db.session.commit()
        
        logger.info(f"✅ Candidate registered: {username}")
        return jsonify({'success': True, 'user': user.to_dict(), 'message': 'Candidate account created successfully'}), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"❌ Failed to register user: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@api_bp.route('/admin/users', methods=['POST'])
@jwt_required()
@role_required('admin')
def create_user():
    """Admin-only endpoint to create interviewers or other users"""
    try:
        data = request.get_json() or {}
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role', 'interviewer')
        full_name = data.get('full_name')
        phone = data.get('phone')
        
        if not username or not email or not password:
            return jsonify({'error': 'username, email and password are required'}), 400
        
        if role not in ['admin', 'interviewer', 'candidate']:
            return jsonify({'error': 'Invalid role. Must be admin, interviewer, or candidate'}), 400
        
        if User.query.filter((User.username == username) | (User.email == email)).first():
            return jsonify({'error': 'User with this username or email already exists'}), 400
        
        current_user_id = get_jwt_identity()
        
        user = User(
            username=username, 
            email=email, 
            role=role,
            full_name=full_name,
            phone=phone,
            is_active=True,
            created_by=current_user_id
        )
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        
        logger.info(f"✅ Admin {current_user_id} created {role}: {username}")
        return jsonify({
            'success': True, 
            'user': user.to_dict(),
            'temporary_password': password,
            'message': f'{role.capitalize()} account created successfully'
        }), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"❌ Failed to create user: {e}")
        return jsonify({'error': str(e)}), 500


@api_bp.route('/admin/users', methods=['GET'])
@jwt_required()
@role_required('admin')
def list_users():
    """Admin-only endpoint to list all users"""
    try:
        users = User.query.order_by(User.created_at.desc()).all()
        return jsonify({'users': [user.to_dict() for user in users]}), 200
    except Exception as e:
        logger.error(f"❌ Failed to list users: {e}")
        return jsonify({'error': str(e)}), 500


@api_bp.route('/admin/users/<int:user_id>', methods=['PUT'])
@jwt_required()
@role_required('admin')
def update_user(user_id):
    """Admin-only endpoint to update user details"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json() or {}
        
        if 'is_active' in data:
            user.is_active = data['is_active']
        if 'role' in data and data['role'] in ['admin', 'interviewer', 'candidate']:
            user.role = data['role']
        if 'full_name' in data:
            user.full_name = data['full_name']
        if 'phone' in data:
            user.phone = data['phone']
        if 'email' in data:
            user.email = data['email']
        
        db.session.commit()
        logger.info(f"✅ Admin updated user {user_id}")
        return jsonify({'success': True, 'user': user.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"❌ Failed to update user: {e}")
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
        
        # Check if user is active
        if not user.is_active:
            return jsonify({'error': 'Account is deactivated. Contact administrator.'}), 403
        
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        logger.info(f"✅ User logged in: {user.username} ({user.role})")
        return jsonify({
            'access_token': access_token, 
            'refresh_token': refresh_token, 
            'user': user.to_dict()
        })
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
    """List jobs with role-based access control"""
    try:
        # Get current user from JWT
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Admin sees all jobs
        if current_user.role == 'admin':
            jobs = Job.query.filter_by(status='active').order_by(Job.created_at.desc()).all()
            logger.info(f"👑 Admin viewing all {len(jobs)} jobs")
        # Interviewer sees only their own jobs
        elif current_user.role == 'interviewer':
            jobs = Job.query.filter_by(created_by=current_user_id, status='active').order_by(Job.created_at.desc()).all()
            logger.info(f"👤 Interviewer {current_user_id} viewing their {len(jobs)} jobs")
        else:
            # Candidates should not list jobs - they access via link only
            return jsonify({'error': 'Candidates can only access interviews through shared links'}), 403
        
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
@interview_bp.route('/access/<int:job_id>', methods=['POST'])
def track_interview_access(job_id):
    """Track when a candidate accesses an interview link (creates interview if not exists)"""
    try:
        data = request.get_json() or {}
        
        job = Job.query.get(job_id)
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        
        candidate_email = data.get('candidate_email', '')
        
        # Check if interview already exists for this candidate and job
        existing_interview = None
        if candidate_email:
            existing_interview = Interview.query.filter_by(
                job_id=job_id,
                candidate_email=candidate_email
            ).first()
        
        if existing_interview:
            # Update accessed_at if not already set
            if not existing_interview.accessed_at:
                existing_interview.accessed_at = datetime.now()
                db.session.commit()
                logger.info(f"✅ Interview {existing_interview.id} accessed by {candidate_email}")
            return jsonify({'success': True, 'interview': existing_interview.to_dict()}), 200
        else:
            # Create new interview record when link is accessed
            interview = Interview(
                job_id=job_id,
                candidate_name=data.get('candidate_name', ''),
                candidate_email=candidate_email,
                candidate_phone=data.get('candidate_phone', ''),
                status='pending',
                accessed_at=datetime.now()
            )
            db.session.add(interview)
            db.session.commit()
            logger.info(f"✅ New interview {interview.id} created and accessed by {candidate_email}")
            return jsonify({'success': True, 'interview': interview.to_dict()}), 201
            
    except Exception as e:
        db.session.rollback()
        logger.error(f"❌ Failed to track interview access: {e}")
        return jsonify({'error': str(e)}), 500


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
            accessed_at=datetime.now(),
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
            # Return questions sorted by order_index
            sorted_questions = sorted(existing, key=lambda q: q.order_index or 0)
            return jsonify({'questions': [q.to_dict() for q in sorted_questions]})

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
        
        if github_copilot_service and github_copilot_service.enabled:
            try:
                logger.info(f"🤖 Starting AI question generation for job: {job.title}")
                logger.info(f"📄 CV available: {bool(cv_text)}, Duration: {job.duration_minutes} mins")
                
                # Use asyncio to run the async function
                import asyncio
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                ai_questions = loop.run_until_complete(
                    github_copilot_service.generate_questions(
                        job.description,
                        job.requirements or "General qualifications",
                        num_questions=5,
                        cv_text=cv_text,  # RAG context from CV
                        duration_minutes=job.duration_minutes or 20,
                        scoring_criteria=job.scoring_criteria
                    )
                )
                loop.close()
                
                logger.info(f"✅ AI-generated {len(ai_questions)} questions using GitHub Copilot")
                logger.info(f"📝 Questions: {ai_questions[:2]}...")  # Log first 2 questions
                
                # Create Question objects from AI responses
                for idx, q_text in enumerate(ai_questions):
                    db.session.add(Question(
                        interview_id=interview_id,
                        question=q_text,
                        question_type='ai_generated',
                        order_index=idx + 1
                    ))
                    
            except Exception as e:
                logger.error(f"❌ AI question generation failed: {e}", exc_info=True)
                logger.warning(f"⚠️ Using fallback questions")
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
    """Submit an interview response with AI analysis"""
    try:
        data = request.get_json()
        if not data or not data.get('question_id'):
            return jsonify({'error': 'question_id is required'}), 400

        # Get question and interview context
        question = Question.query.get(data['question_id'])
        interview = Interview.query.get(interview_id)
        job = Job.query.get(interview.job_id) if interview else None
        
        answer_text = data.get('answer_text', '')
        
        # Initialize with default scores
        scores = {
            'confidence_score': 70,
            'relevance_score': 70,
            'technical_score': 70,
            'communication_score': 70,
            'ai_feedback': 'Response recorded. AI analysis pending.'
        }
        
        # Perform AI analysis if available
        if github_copilot_service and github_copilot_service.enabled and question and answer_text:
            try:
                import asyncio
                
                # Extract CV text if available
                cv_text = None
                if interview and interview.cv_file_path:
                    try:
                        from utils.cv_parser import extract_text_from_cv
                        cv_text = extract_text_from_cv(interview.cv_file_path)
                    except Exception as cv_err:
                        logger.warning(f"⚠️ CV parsing failed: {cv_err}")
                
                # Get job context
                job_context = f"{job.title}: {job.description[:200]}" if job else "General position"
                
                # Run AI analysis
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                analysis = loop.run_until_complete(
                    github_copilot_service.analyze_response(
                        question.question,
                        answer_text,
                        job_context=job_context,
                        cv_text=cv_text
                    )
                )
                loop.close()
                
                # Update scores from AI analysis
                scores['confidence_score'] = analysis.get('confidence_score', 70)
                scores['relevance_score'] = analysis.get('relevance_score', 70)
                scores['technical_score'] = analysis.get('technical_score', 70)
                scores['communication_score'] = analysis.get('communication_score', 70)
                scores['ai_feedback'] = analysis.get('feedback', 'Analysis completed.')
                
                logger.info(f"🤖 AI Analysis: R={scores['relevance_score']}, T={scores['technical_score']}, Cm={scores['communication_score']}, Cf={scores['confidence_score']}")
                
            except Exception as ai_err:
                logger.error(f"⚠️ AI analysis failed: {ai_err}")
                # Keep default scores if AI fails
        
        # Create response with AI scores
        response = Response(
            interview_id=interview_id,
            question_id=data['question_id'],
            answer_text=answer_text,
            answer_duration=data.get('answer_duration', 0),
            confidence_score=scores['confidence_score'],
            relevance_score=scores['relevance_score'],
            technical_score=scores['technical_score'],
            communication_score=scores['communication_score']
        )
        db.session.add(response)
        db.session.commit()

        logger.info(f"✅ Response submitted for interview {interview_id} with AI scoring")
        return jsonify({
            'success': True, 
            'response': response.to_dict(),
            'ai_feedback': scores['ai_feedback']
        }), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"❌ Failed to submit response: {e}")
        import traceback
        traceback.print_exc()
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
    """Mark interview as completed and compute final score with AI analysis"""
    try:
        interview = Interview.query.get(interview_id)
        if not interview:
            return jsonify({'error': 'Interview not found'}), 404

        responses = Response.query.filter_by(interview_id=interview_id).all()
        questions = Question.query.filter_by(interview_id=interview_id).all()
        
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

        # Generate comprehensive AI analysis
        ai_analysis = None
        if github_copilot_service and github_copilot_service.enabled:
            try:
                import asyncio
                from models.models import Job
                
                # Prepare data for AI analysis
                job = Job.query.get(interview.job_id)
                
                interview_data = {
                    'candidate_name': interview.candidate_name,
                    'candidate_email': interview.candidate_email,
                    'avg_confidence': avg_confidence,
                    'avg_relevance': avg_relevance,
                    'avg_technical': avg_technical,
                    'avg_communication': avg_communication,
                    'avg_score': avg_score
                }
                
                # Create question-answer pairs
                question_map = {q.id: q.question for q in questions}
                responses_data = [
                    {
                        'question': question_map.get(r.question_id, 'Unknown'),
                        'answer': r.answer_text or '',
                        'relevance': r.relevance_score or 0,
                        'technical': r.technical_score or 0,
                        'communication': r.communication_score or 0,
                        'confidence': r.confidence_score or 0
                    }
                    for r in responses
                ]
                
                job_data = {
                    'title': job.title if job else 'Unknown',
                    'description': job.description if job else ''
                }
                
                # Run AI analysis with timeout
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                try:
                    # Set timeout for AI analysis (60 seconds)
                    ai_analysis = loop.run_until_complete(
                        asyncio.wait_for(
                            github_copilot_service.generate_final_analysis(
                                interview_data,
                                responses_data,
                                job_data
                            ),
                            timeout=60.0
                        )
                    )
                    logger.info(f"🤖 AI Final Analysis Generated: {ai_analysis.get('recommendation', 'Unknown')}")
                except asyncio.TimeoutError:
                    logger.error(f"⚠️ AI final analysis timed out after 60 seconds")
                    ai_analysis = None
                finally:
                    loop.close()
                
            except Exception as ai_err:
                logger.error(f"⚠️ AI final analysis failed: {ai_err}")
                import traceback
                traceback.print_exc()
        
        # Fallback analysis if AI fails
        if not ai_analysis:
            ai_analysis = {
                'overall_assessment': f'{interview.candidate_name} completed the interview with {num_responses} responses and scored {avg_score}/100.',
                'strengths': [
                    'Completed all interview questions',
                    'Demonstrated good engagement' if avg_score >= 70 else 'Participated in the process',
                    f'Achieved {avg_score}/100 overall'
                ],
                'weaknesses': [
                    'Could provide more technical depth' if avg_technical < 75 else 'Continue developing skills',
                    'Practice structured responses' if avg_communication < 75 else 'Good communication shown'
                ],
                'recommendation': 'Recommended for next round' if avg_score >= 70 else 'Consider for future opportunities',
                'next_steps': 'Schedule technical interview' if avg_score >= 75 else 'Provide feedback and reconsider later'
            }
        
        # Add scores to analysis
        ai_analysis['scores'] = {
            'confidence': avg_confidence,
            'relevance': avg_relevance,
            'technical': avg_technical,
            'communication': avg_communication,
            'overall': avg_score
        }

        interview.final_score = avg_score
        interview.status = 'completed'
        interview.completed_at = datetime.now()
        interview.ai_analysis = ai_analysis
        
        # Generate candidate feedback
        candidate_feedback = _generate_candidate_feedback(interview, responses, ai_analysis)
        interview.ai_analysis['candidate_feedback'] = candidate_feedback
        
        db.session.commit()

        logger.info(f"✅ Interview completed: {interview_id} with score {avg_score}")
        return jsonify({'success': True, 'final_score': interview.final_score, 'ai_analysis': ai_analysis}), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"❌ Failed to complete interview: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


def _generate_candidate_feedback(interview, responses, ai_analysis):
    """Generate personalized feedback for candidate"""
    scores = ai_analysis.get('scores', {})
    overall_score = scores.get('overall', 0)
    
    # Determine performance level
    if overall_score >= 85:
        performance_level = "Excellent"
        encouragement = "You demonstrated outstanding performance throughout the interview!"
    elif overall_score >= 70:
        performance_level = "Good"
        encouragement = "You showed solid skills and good understanding of the concepts."
    elif overall_score >= 55:
        performance_level = "Fair"
        encouragement = "You have a foundation to build upon. Keep developing your skills!"
    else:
        performance_level = "Needs Improvement"
        encouragement = "This is a learning opportunity. Focus on strengthening your fundamentals."
    
    # Analyze strengths
    strengths = []
    if scores.get('communication', 0) >= 75:
        strengths.append({
            'area': 'Communication',
            'description': 'You articulated your thoughts clearly and effectively.',
            'score': scores.get('communication', 0)
        })
    if scores.get('technical', 0) >= 75:
        strengths.append({
            'area': 'Technical Knowledge',
            'description': 'You demonstrated strong technical understanding.',
            'score': scores.get('technical', 0)
        })
    if scores.get('confidence', 0) >= 75:
        strengths.append({
            'area': 'Confidence',
            'description': 'You showed confidence in your responses.',
            'score': scores.get('confidence', 0)
        })
    if scores.get('relevance', 0) >= 75:
        strengths.append({
            'area': 'Relevance',
            'description': 'Your answers were well-aligned with the questions.',
            'score': scores.get('relevance', 0)
        })
    
    # Analyze areas for improvement
    improvements = []
    if scores.get('communication', 0) < 70:
        improvements.append({
            'area': 'Communication',
            'suggestion': 'Practice structuring your responses with clear introduction, body, and conclusion.',
            'score': scores.get('communication', 0)
        })
    if scores.get('technical', 0) < 70:
        improvements.append({
            'area': 'Technical Knowledge',
            'suggestion': 'Deepen your understanding of core concepts through practice and study.',
            'score': scores.get('technical', 0)
        })
    if scores.get('confidence', 0) < 70:
        improvements.append({
            'area': 'Confidence',
            'suggestion': 'Build confidence through mock interviews and practice sessions.',
            'score': scores.get('confidence', 0)
        })
    if scores.get('relevance', 0) < 70:
        improvements.append({
            'area': 'Answer Relevance',
            'suggestion': 'Listen carefully to questions and ensure your answers directly address them.',
            'score': scores.get('relevance', 0)
        })
    
    # Check CV monitoring for additional feedback
    cv_feedback = None
    if interview.cv_monitoring_report and interview.cv_monitoring_report.get('success'):
        cv_report = interview.cv_monitoring_report
        risk_level = cv_report.get('risk_level', 'low')
        total_warnings = cv_report.get('total_warnings', 0)
        
        if total_warnings > 0:
            cv_feedback = {
                'professionalism_score': max(0, 100 - (total_warnings * 5)),  # Deduct 5 points per warning
                'risk_level': risk_level,
                'message': f"Our monitoring system detected {total_warnings} alert(s) during your interview. ",
                'suggestions': []
            }
            
            detection_breakdown = cv_report.get('detection_breakdown', {})
            if detection_breakdown.get('no_face', 0) > 0:
                cv_feedback['suggestions'].append("Ensure your camera is properly positioned and well-lit throughout the interview.")
            if detection_breakdown.get('looking_away', 0) > 0:
                cv_feedback['suggestions'].append("Maintain eye contact with the camera to show engagement.")
            if detection_breakdown.get('mobile_phone', 0) > 0:
                cv_feedback['suggestions'].append("Avoid using mobile devices during interviews to maintain professionalism.")
            if detection_breakdown.get('multiple_faces', 0) > 0:
                cv_feedback['suggestions'].append("Ensure you are alone in a quiet space for interviews.")
    
    return {
        'performance_level': performance_level,
        'overall_score': overall_score,
        'encouragement': encouragement,
        'strengths': strengths,
        'areas_for_improvement': improvements,
        'cv_monitoring_feedback': cv_feedback,
        'next_steps': [
            'Review your responses and identify patterns in your answers',
            'Practice answering similar questions to improve fluency',
            'Focus on the areas marked for improvement',
            'Practice answering technical questions in depth' if scores.get('technical', 0) < 75 else 'Continue building on your technical strengths'
        ],
        'overall_message': f"Thank you for completing the interview, {interview.candidate_name}. {encouragement} Your overall score of {overall_score}/100 places you in the '{performance_level}' category. Keep working on your skills and best of luck in your career journey!"
    }


@interview_bp.route('/my-interviews', methods=['GET'])
def get_my_interviews():
    """Get all interviews accessed by the current candidate"""
    try:
        # Get candidate email from query params (since candidates don't have JWT auth)
        candidate_email = request.args.get('email')
        
        if not candidate_email:
            return jsonify({'error': 'Email parameter is required'}), 400
        
        # Get all interviews accessed by this candidate
        interviews = Interview.query.filter_by(
            candidate_email=candidate_email
        ).filter(
            Interview.accessed_at.isnot(None)
        ).order_by(
            Interview.accessed_at.desc()
        ).all()
        
        # Include job details with each interview
        results = []
        for interview in interviews:
            interview_dict = interview.to_dict()
            job = Job.query.get(interview.job_id)
            if job:
                interview_dict['job'] = job.to_dict()
            results.append(interview_dict)
        
        logger.info(f"✅ Retrieved {len(results)} interviews for {candidate_email}")
        return jsonify({'interviews': results}), 200
        
    except Exception as e:
        logger.error(f"❌ Failed to get candidate interviews: {e}")
        return jsonify({'error': str(e)}), 500


@interview_bp.route('/<int:interview_id>/feedback', methods=['GET'])
def get_candidate_feedback(interview_id):
    """Get candidate feedback for completed interview"""
    try:
        interview = Interview.query.get(interview_id)
        if not interview:
            return jsonify({'error': 'Interview not found'}), 404
        
        if interview.status != 'completed':
            return jsonify({'error': 'Interview not yet completed'}), 400
        
        feedback = interview.ai_analysis.get('candidate_feedback') if interview.ai_analysis else None
        
        if not feedback:
            return jsonify({'error': 'Feedback not available'}), 404
        
        return jsonify({
            'success': True,
            'feedback': feedback,
            'interview': {
                'id': interview.id,
                'candidate_name': interview.candidate_name,
                'completed_at': interview.completed_at.isoformat() if interview.completed_at else None,
                'final_score': interview.final_score
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Failed to get candidate feedback: {e}")
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


@monitoring_bp.route('/screenshots/<path:filename>', methods=['GET'])
def get_screenshot(filename):
    """Serve CV monitoring screenshot"""
    try:
        screenshots_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads', 'cv_screenshots')
        return send_from_directory(screenshots_dir, filename)
    except Exception as e:
        logger.error(f"Failed to serve screenshot: {e}")
        return jsonify({'error': 'Screenshot not found'}), 404


# =============== CV MONITORING ROUTES ===============
@monitoring_bp.route('/start/<int:interview_id>', methods=['POST', 'OPTIONS'])
def start_monitoring(interview_id):
    """Start CV monitoring for an interview"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        logger.info(f"🎥 Starting CV monitoring for interview {interview_id}")
        
        # Verify interview exists
        interview = Interview.query.get(interview_id)
        if not interview:
            return jsonify({'error': 'Interview not found'}), 404
        
        # Start monitoring
        success = cv_monitoring_service.start_monitoring(interview_id)
        
        if success:
            logger.info(f"✅ CV monitoring started for interview {interview_id}")
            return jsonify({
                'success': True,
                'message': 'Monitoring started',
                'interview_id': interview_id
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to start monitoring (CV service may not be available)'
            }), 500
            
    except Exception as e:
        logger.error(f"❌ Failed to start monitoring: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@monitoring_bp.route('/analyze/<int:interview_id>', methods=['POST', 'OPTIONS'])
def analyze_frame(interview_id):
    """Analyze a video frame for violations"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.json
        frame_data = data.get('frame')
        
        if not frame_data:
            return jsonify({'error': 'No frame data provided'}), 400
        
        # Analyze frame
        result = cv_monitoring_service.analyze_frame(interview_id, frame_data)
        
        if result['success']:
            # Log any warnings
            if result.get('warnings'):
                for warning in result['warnings']:
                    logger.warning(f"⚠️ Interview {interview_id} - {warning['type']}: {warning['message']}")
            
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"❌ Frame analysis failed: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


@monitoring_bp.route('/status/<int:interview_id>', methods=['GET', 'OPTIONS'])
def get_monitoring_status(interview_id):
    """Get current monitoring status"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        status = cv_monitoring_service.get_monitoring_status(interview_id)
        return jsonify(status), 200
        
    except Exception as e:
        logger.error(f"❌ Failed to get monitoring status: {e}")
        return jsonify({'error': str(e)}), 500


@monitoring_bp.route('/stop/<int:interview_id>', methods=['POST', 'OPTIONS'])
def stop_monitoring(interview_id):
    """Stop monitoring and get final summary"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        logger.info(f"🏁 Stopping CV monitoring for interview {interview_id}")
        
        # Stop monitoring and get report
        report = cv_monitoring_service.stop_monitoring(interview_id)
        
        if report['success']:
            # Save monitoring report to interview
            interview = Interview.query.get(interview_id)
            if interview:
                interview.cv_monitoring_report = report
                db.session.commit()
                logger.info(f"💾 Saved CV monitoring report to interview {interview_id}")
            
            logger.info(f"✅ Monitoring stopped - Risk: {report['risk_level']}, Warnings: {report['total_warnings']}")
            return jsonify(report), 200
        else:
            return jsonify(report), 400
            
    except Exception as e:
        logger.error(f"❌ Failed to stop monitoring: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

