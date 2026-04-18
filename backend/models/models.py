from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import uuid


db = SQLAlchemy()


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(32), nullable=False, default='candidate')  # 'admin', 'interviewer', 'employee', or 'candidate'
    full_name = db.Column(db.String(150))
    phone = db.Column(db.String(20))
    is_active = db.Column(db.Boolean, default=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))  # Admin who created this user
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    cv_url = db.Column(db.String(500))

    def set_password(self, password: str):
        # Use pbkdf2:sha256 with lower iteration count for faster hashing
        # Good for development, increase iterations in production
        self.password_hash = generate_password_hash(password, method='pbkdf2:sha256', salt_length=8)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id, 
            'username': self.username, 
            'email': self.email, 
            'role': self.role,
            'full_name': self.full_name,
            'phone': self.phone,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Job(db.Model):
    __tablename__ = 'jobs'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    requirements = db.Column(db.Text)
    duration_minutes = db.Column(db.Integer, default=20)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))  # Interviewer ID
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=True)
    status = db.Column(db.String(20), default='active')
    scoring_criteria = db.Column(db.JSON)
    # ── Product flow columns ──
    share_token = db.Column(db.String(64), unique=True, default=lambda: uuid.uuid4().hex)
    max_shortlist = db.Column(db.Integer, default=5)
    max_cv_uploads = db.Column(db.Integer, default=100)  # max CVs accepted for this job
    link_active_days = db.Column(db.Integer, default=14)  # days the apply link stays active
    scheduling_window_days = db.Column(db.Integer, default=7)  # days within which interviews are scheduled
    max_concurrent_interviews = db.Column(db.Integer, default=3)  # max interviews running at same time
    application_deadline = db.Column(db.DateTime)
    is_published = db.Column(db.Boolean, default=False)
    auto_schedule = db.Column(db.Boolean, default=False)
    company_name = db.Column(db.String(200))
    logo_url = db.Column(db.String(500))
    must_ask_questions_json = db.Column('must_ask_questions', db.JSON)
    location = db.Column(db.String(200))
    job_type = db.Column(db.String(50), default='full_time')  # full_time, part_time, contract, internship
    salary_range = db.Column(db.String(100))
    total_applications = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    interviews = db.relationship('Interview', backref='job', lazy=True, cascade='all, delete-orphan')
    applications = db.relationship('CandidateApplication', backref='job', lazy=True, cascade='all, delete-orphan')
    creator = db.relationship('User', foreign_keys=[created_by], backref='jobs_created')
    client_ref = db.relationship('Client', foreign_keys=[client_id], backref='jobs')
    
    def to_dict(self):
        return {
            'id': self.id, 
            'title': self.title, 
            'description': self.description, 
            'requirements': self.requirements, 
            'duration_minutes': self.duration_minutes, 
            'created_by': self.created_by,
            'client_id': self.client_id,
            'status': self.status,
            'is_active': self.status == 'active',
            'scoring_criteria': self.scoring_criteria or {},
            'share_token': self.share_token,
            'max_shortlist': self.max_shortlist,
            'max_cv_uploads': self.max_cv_uploads,
            'link_active_days': self.link_active_days,
            'scheduling_window_days': self.scheduling_window_days,
            'max_concurrent_interviews': self.max_concurrent_interviews,
            'application_deadline': self.application_deadline.isoformat() if self.application_deadline else None,
            'is_published': self.is_published,
            'auto_schedule': self.auto_schedule,
            'company_name': self.company_name,
            'logo_url': self.logo_url,
            'must_ask_questions': self.must_ask_questions_json or [],
            'location': self.location,
            'job_type': self.job_type,
            'salary_range': self.salary_range,
            'total_applications': self.total_applications,
            'created_at': self.created_at.isoformat() if self.created_at else None, 
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'interviews': [interview.to_dict() for interview in self.interviews]
        }


class CandidateApplication(db.Model):
    """Tracks candidate job applications — the ATS pipeline entry point"""
    __tablename__ = 'candidate_applications'
    __table_args__ = (db.UniqueConstraint('job_id', 'candidate_email', name='uq_job_email'),)

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)
    candidate_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    candidate_name = db.Column(db.String(150), nullable=False)
    candidate_email = db.Column(db.String(150), nullable=False)
    candidate_phone = db.Column(db.String(30))
    cv_file_path = db.Column(db.String(500))
    cv_text = db.Column(db.Text)  # extracted text for ATS scoring
    ats_score = db.Column(db.Float)  # 0-100
    ats_breakdown = db.Column(db.JSON)  # detailed scoring dimensions
    status = db.Column(db.String(30), default='applied')
    # applied → scoring → shortlisted / rejected → scheduled → interviewed → hired / archived
    rejection_reason = db.Column(db.Text)
    applied_at = db.Column(db.DateTime, default=datetime.utcnow)
    scored_at = db.Column(db.DateTime)
    shortlisted_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    candidate = db.relationship('User', foreign_keys=[candidate_id], backref='applications')
    interviews = db.relationship('Interview', backref='application', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'job_id': self.job_id,
            'candidate_id': self.candidate_id,
            'candidate_name': self.candidate_name,
            'candidate_email': self.candidate_email,
            'candidate_phone': self.candidate_phone,
            'cv_file_path': self.cv_file_path,
            'ats_score': self.ats_score,
            'ats_breakdown': self.ats_breakdown or {},
            'status': self.status,
            'rejection_reason': self.rejection_reason,
            'applied_at': self.applied_at.isoformat() if self.applied_at else None,
            'scored_at': self.scored_at.isoformat() if self.scored_at else None,
            'shortlisted_at': self.shortlisted_at.isoformat() if self.shortlisted_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


class Interview(db.Model):
    __tablename__ = 'interviews'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)
    application_id = db.Column(db.Integer, db.ForeignKey('candidate_applications.id'), nullable=True)
    candidate_name = db.Column(db.String(100))
    candidate_email = db.Column(db.String(100))
    candidate_phone = db.Column(db.String(20))
    cv_file_path = db.Column(db.String(500))
    status = db.Column(db.String(20), default='pending')
    accessed_at = db.Column(db.DateTime)  # Track when candidate first accessed the link
    started_at = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)
    final_score = db.Column(db.Float)
    ai_analysis = db.Column(db.JSON)
    cv_monitoring_report = db.Column(db.JSON)
    recording_url = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    questions = db.relationship('Question', backref='interview', lazy=True, cascade='all, delete-orphan')
    responses = db.relationship('Response', backref='interview', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id, 
            'job_id': self.job_id, 
            'candidate_name': self.candidate_name, 
            'candidate_email': self.candidate_email, 
            'candidate_phone': self.candidate_phone,
            'cv_file_path': self.cv_file_path,
            'status': self.status, 
            'accessed_at': self.accessed_at.isoformat() if self.accessed_at else None,
            'started_at': self.started_at.isoformat() if self.started_at else None, 
            'completed_at': self.completed_at.isoformat() if self.completed_at else None, 
            'final_score': self.final_score, 
            'ai_analysis': self.ai_analysis or {}, 
            'cv_monitoring_report': self.cv_monitoring_report or {},
            'recording_url': self.recording_url, 
            'created_at': self.created_at.isoformat() if self.created_at else None, 
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'questions': [q.to_dict() for q in self.questions],
            'responses': [r.to_dict() for r in self.responses]
        }


class Question(db.Model):
    __tablename__ = 'questions'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    interview_id = db.Column(db.Integer, db.ForeignKey('interviews.id'), nullable=False)
    question = db.Column(db.Text, nullable=False)
    question_type = db.Column(db.String(50))
    difficulty_level = db.Column(db.String(20))
    expected_duration = db.Column(db.Integer)
    order_index = db.Column(db.Integer)
    ai_context = db.Column(db.JSON)
    parent_question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), nullable=True)  # For follow-up questions
    is_followup = db.Column(db.Boolean, default=False)  # Flag to identify follow-up questions
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    responses = db.relationship('Response', backref='question', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id, 
            'interview_id': self.interview_id, 
            'question': self.question, 
            'question_type': self.question_type, 
            'difficulty_level': self.difficulty_level, 
            'expected_duration': self.expected_duration, 
            'order_index': self.order_index, 
            'ai_context': self.ai_context or {}, 
            'parent_question_id': self.parent_question_id,
            'is_followup': self.is_followup,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Response(db.Model):
    __tablename__ = 'responses'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    interview_id = db.Column(db.Integer, db.ForeignKey('interviews.id'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), nullable=False)
    answer_text = db.Column(db.Text)
    answer_audio_url = db.Column(db.String(500))
    answer_video_url = db.Column(db.String(500))
    answer_duration = db.Column(db.Integer)
    voice_analysis_data = db.Column(db.JSON)  # Store voice metrics
    confidence_score = db.Column(db.Float)
    relevance_score = db.Column(db.Float)
    technical_score = db.Column(db.Float)
    communication_score = db.Column(db.Float)
    ai_feedback = db.Column(db.Text)
    detected_emotions = db.Column(db.JSON)
    behavioral_flags = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        # Get the question text from the related question
        question_text = self.question.question if self.question else "Question not found"
        
        return {
            'id': self.id, 
            'interview_id': self.interview_id, 
            'question_id': self.question_id,
            'question_text': question_text,
            'answer_text': self.answer_text, 
            'answer_audio_url': self.answer_audio_url, 
            'answer_video_url': self.answer_video_url, 
            'answer_duration': self.answer_duration,
            'voice_analysis_data': self.voice_analysis_data or {},
            'confidence_score': self.confidence_score, 
            'relevance_score': self.relevance_score, 
            'technical_score': self.technical_score, 
            'communication_score': self.communication_score, 
            'ai_feedback': self.ai_feedback, 
            'detected_emotions': self.detected_emotions or {}, 
            'behavioral_flags': self.behavioral_flags or {}, 
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class HRDocument(db.Model):
    """Store HR policy documents and company information"""
    __tablename__ = 'hr_documents'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(50), nullable=False)  # 'policy', 'procedure', 'benefits', 'onboarding', 'general'
    file_path = db.Column(db.String(500), nullable=False)
    file_type = db.Column(db.String(20))  # 'pdf', 'docx', 'txt'
    file_size = db.Column(db.Integer)  # in bytes
    document_id = db.Column(db.String(100), unique=True, nullable=False)  # Unique ID for vector DB
    uploaded_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    version = db.Column(db.Integer, default=1)
    tags = db.Column(db.JSON)  # Array of tags for categorization
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    uploader = db.relationship('User', foreign_keys=[uploaded_by], backref='uploaded_documents')
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'file_path': self.file_path,
            'file_type': self.file_type,
            'file_size': self.file_size,
            'document_id': self.document_id,
            'uploaded_by': self.uploaded_by,
            'uploader_name': self.uploader.full_name if self.uploader else None,
            'is_active': self.is_active,
            'version': self.version,
            'tags': self.tags or [],
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class ChatConversation(db.Model):
    """Store HR chatbot conversations for history and analytics"""
    __tablename__ = 'chat_conversations'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    session_id = db.Column(db.String(100), nullable=False)  # UUID for grouping messages
    title = db.Column(db.String(200))  # Auto-generated or user-set
    is_active = db.Column(db.Boolean, default=True)
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_message_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user = db.relationship('User', foreign_keys=[user_id], backref='chat_conversations')
    messages = db.relationship('ChatMessage', backref='conversation', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self, include_messages=False):
        result = {
            'id': self.id,
            'user_id': self.user_id,
            'session_id': self.session_id,
            'title': self.title,
            'is_active': self.is_active,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'last_message_at': self.last_message_at.isoformat() if self.last_message_at else None,
            'message_count': len(self.messages) if self.messages else 0
        }
        
        if include_messages:
            result['messages'] = [msg.to_dict() for msg in self.messages]
        
        return result


class CandidateReport(db.Model):
    """Rich candidate report generated via DeepSeek after interview completion"""
    __tablename__ = 'candidate_reports'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    interview_id = db.Column(db.Integer, db.ForeignKey('interviews.id'), unique=True, nullable=False)
    report_data = db.Column(db.JSON, nullable=False)  # Full report JSON from all DeepSeek calls
    status = db.Column(db.String(20), default='pending')  # pending, generating, completed, failed
    error_message = db.Column(db.Text)
    generated_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    interview = db.relationship('Interview', backref=db.backref('candidate_report', uselist=False))

    def to_dict(self):
        return {
            'id': self.id,
            'interview_id': self.interview_id,
            'report_data': self.report_data or {},
            'status': self.status,
            'error_message': self.error_message,
            'generated_at': self.generated_at.isoformat() if self.generated_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


class InterviewSchedule(db.Model):
    """Scheduling info for shortlisted candidate interviews"""
    __tablename__ = 'interview_schedules'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    interview_id = db.Column(db.Integer, db.ForeignKey('interviews.id'), unique=True, nullable=False)
    application_id = db.Column(db.Integer, db.ForeignKey('candidate_applications.id'), nullable=False)
    scheduled_at = db.Column(db.DateTime, nullable=False)
    duration_minutes = db.Column(db.Integer, default=30)
    timezone = db.Column(db.String(50), default='UTC')
    meeting_link = db.Column(db.String(500))
    status = db.Column(db.String(30), default='scheduled')
    # scheduled → reminded → in_progress → completed → cancelled → no_show
    reschedule_count = db.Column(db.Integer, default=0)  # max 1 reschedule allowed
    invitation_sent_at = db.Column(db.DateTime)
    reminder_sent_at = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)
    cancelled_at = db.Column(db.DateTime)
    cancellation_reason = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    interview = db.relationship('Interview', backref=db.backref('schedule', uselist=False))
    application = db.relationship('CandidateApplication', backref=db.backref('schedule', uselist=False))

    def to_dict(self):
        return {
            'id': self.id,
            'interview_id': self.interview_id,
            'application_id': self.application_id,
            'scheduled_at': self.scheduled_at.isoformat() if self.scheduled_at else None,
            'duration_minutes': self.duration_minutes,
            'timezone': self.timezone,
            'meeting_link': self.meeting_link,
            'status': self.status,
            'reschedule_count': self.reschedule_count,
            'can_reschedule': (self.reschedule_count or 0) < 1,
            'invitation_sent_at': self.invitation_sent_at.isoformat() if self.invitation_sent_at else None,
            'reminder_sent_at': self.reminder_sent_at.isoformat() if self.reminder_sent_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class EmailLog(db.Model):
    """Audit trail of all system emails"""
    __tablename__ = 'email_logs'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    recipient_email = db.Column(db.String(200), nullable=False)
    recipient_name = db.Column(db.String(200))
    email_type = db.Column(db.String(50), nullable=False)
    # application_received, ats_complete, shortlisted, rejected,
    # interview_invite, interview_reminder, interview_completed, report_ready
    subject = db.Column(db.String(500), nullable=False)
    body_html = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')  # pending, sent, failed, bounced
    related_job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=True)
    related_application_id = db.Column(db.Integer, db.ForeignKey('candidate_applications.id'), nullable=True)
    error_message = db.Column(db.Text)
    sent_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'recipient_email': self.recipient_email,
            'recipient_name': self.recipient_name,
            'email_type': self.email_type,
            'subject': self.subject,
            'status': self.status,
            'sent_at': self.sent_at.isoformat() if self.sent_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class Notification(db.Model):
    """In-app notifications for users"""
    __tablename__ = 'notifications'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), default='info')
    # info, success, warning, error, application, interview, report
    is_read = db.Column(db.Boolean, default=False)
    link = db.Column(db.String(500))
    related_job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=True)
    related_application_id = db.Column(db.Integer, db.ForeignKey('candidate_applications.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', foreign_keys=[user_id], backref='notifications')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'message': self.message,
            'type': self.type,
            'is_read': self.is_read,
            'link': self.link,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class Lead(db.Model):
    """Landing-page Get Started submissions"""
    __tablename__ = 'leads'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    full_name = db.Column(db.String(150), nullable=False)
    job_title = db.Column(db.String(150))
    company_name = db.Column(db.String(200), nullable=False)
    company_size = db.Column(db.String(50))
    industry = db.Column(db.String(100))
    work_email = db.Column(db.String(200), nullable=False)
    phone = db.Column(db.String(30), nullable=False)
    country = db.Column(db.String(100))
    referral_source = db.Column(db.String(200))
    message = db.Column(db.Text)
    selected_plan = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(30), nullable=False, default='new')
    admin_notes = db.Column(db.Text)
    contacted_at = db.Column(db.DateTime)
    confirmed_at = db.Column(db.DateTime)
    converted_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id, 'full_name': self.full_name, 'job_title': self.job_title,
            'company_name': self.company_name, 'company_size': self.company_size,
            'industry': self.industry, 'work_email': self.work_email,
            'phone': self.phone, 'country': self.country,
            'referral_source': self.referral_source, 'message': self.message,
            'selected_plan': self.selected_plan, 'status': self.status,
            'admin_notes': self.admin_notes,
            'contacted_at': self.contacted_at.isoformat() if self.contacted_at else None,
            'confirmed_at': self.confirmed_at.isoformat() if self.confirmed_at else None,
            'converted_at': self.converted_at.isoformat() if self.converted_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


class Client(db.Model):
    """Active client account — confirmed lead with login credentials"""
    __tablename__ = 'clients'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    lead_id = db.Column(db.Integer, db.ForeignKey('leads.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    company_name = db.Column(db.String(200), nullable=False)
    contact_name = db.Column(db.String(150))
    email = db.Column(db.String(200))
    tier = db.Column(db.String(50), nullable=False)
    interview_quota = db.Column(db.Integer, nullable=False, default=0)
    interviews_used = db.Column(db.Integer, nullable=False, default=0)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    subscription_start = db.Column(db.Date)
    subscription_end = db.Column(db.Date)
    quota_reset_date = db.Column(db.Date)
    max_sub_accounts = db.Column(db.Integer, nullable=False, default=3)
    logo_url = db.Column(db.String(500))
    notes = db.Column(db.Text)
    status = db.Column(db.String(30), nullable=False, default='active')
    activated_at = db.Column(db.DateTime, default=datetime.utcnow)
    deactivated_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    lead = db.relationship('Lead', backref=db.backref('client', uselist=False))
    user = db.relationship('User', backref=db.backref('client_profile', uselist=False))
    payments = db.relationship('Payment', backref='client', lazy=True)
    sub_accounts = db.relationship('ClientSubAccount', backref='client', lazy=True, cascade='all, delete-orphan')
    preferences = db.relationship('ClientPreferences', backref='client', uselist=False, cascade='all, delete-orphan')
    must_ask_questions = db.relationship('MustAskQuestion', backref='client', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id, 'lead_id': self.lead_id, 'user_id': self.user_id,
            'company_name': self.company_name, 'contact_name': self.contact_name,
            'email': self.email, 'tier': self.tier,
            'interview_quota': self.interview_quota,
            'interviews_used': self.interviews_used,
            'interviews_remaining': self.interview_quota - self.interviews_used,
            'is_active': self.is_active, 'status': self.status,
            'subscription_start': self.subscription_start.isoformat() if self.subscription_start else None,
            'subscription_end': self.subscription_end.isoformat() if self.subscription_end else None,
            'quota_reset_date': self.quota_reset_date.isoformat() if self.quota_reset_date else None,
            'max_sub_accounts': self.max_sub_accounts,
            'logo_url': self.logo_url, 'notes': self.notes,
            'activated_at': self.activated_at.isoformat() if self.activated_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'user_email': self.user.email if self.user else None,
            'user_name': self.user.full_name if self.user else None,
            'sub_account_count': len(self.sub_accounts) if self.sub_accounts else 0,
        }


class ClientSubAccount(db.Model):
    """Team members under a client account"""
    __tablename__ = 'client_sub_accounts'
    __table_args__ = (db.UniqueConstraint('client_id', 'user_id', name='uq_client_user'),)
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    role = db.Column(db.String(50), nullable=False, default='member')
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('sub_account', uselist=False))

    def to_dict(self):
        return {
            'id': self.id, 'client_id': self.client_id, 'user_id': self.user_id,
            'role': self.role, 'is_active': self.is_active,
            'username': self.user.username if self.user else None,
            'email': self.user.email if self.user else None,
            'full_name': self.user.full_name if self.user else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class ClientPreferences(db.Model):
    """Client notification & data retention preferences"""
    __tablename__ = 'client_preferences'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=False, unique=True)
    notify_quota_80 = db.Column(db.Boolean, nullable=False, default=True)
    notify_data_deletion = db.Column(db.Boolean, nullable=False, default=True)
    notify_interview_complete = db.Column(db.Boolean, nullable=False, default=True)
    data_retention_days = db.Column(db.Integer, nullable=False, default=90)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id, 'client_id': self.client_id,
            'notify_quota_80': self.notify_quota_80,
            'notify_data_deletion': self.notify_data_deletion,
            'notify_interview_complete': self.notify_interview_complete,
            'data_retention_days': self.data_retention_days,
        }


class MustAskQuestion(db.Model):
    """Client-configurable must-ask questions for interviews"""
    __tablename__ = 'must_ask_questions'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=True)
    question_text = db.Column(db.Text, nullable=False)
    order_index = db.Column(db.Integer, nullable=False, default=0)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    job = db.relationship('Job', backref='must_ask_questions_list')

    def to_dict(self):
        return {
            'id': self.id, 'client_id': self.client_id, 'job_id': self.job_id,
            'question_text': self.question_text, 'order_index': self.order_index,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class Payment(db.Model):
    """Payment records"""
    __tablename__ = 'payments'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(10), nullable=False, default='USD')
    payment_method = db.Column(db.String(50))
    payment_ref = db.Column(db.String(200))
    status = db.Column(db.String(30), nullable=False, default='pending')
    description = db.Column(db.Text)
    paid_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id, 'client_id': self.client_id,
            'amount': self.amount, 'currency': self.currency,
            'payment_method': self.payment_method, 'payment_ref': self.payment_ref,
            'status': self.status, 'description': self.description,
            'paid_at': self.paid_at.isoformat() if self.paid_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'client_name': self.client.company_name if self.client else None,
        }


class Refund(db.Model):
    """Manual refund processing"""
    __tablename__ = 'refunds'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    payment_id = db.Column(db.Integer, db.ForeignKey('payments.id'), nullable=False)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    reason = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(30), nullable=False, default='pending')
    processed_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    processed_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    payment = db.relationship('Payment', backref=db.backref('refund', uselist=False))
    client = db.relationship('Client', backref='refunds')
    processor = db.relationship('User', foreign_keys=[processed_by])

    def to_dict(self):
        return {
            'id': self.id, 'payment_id': self.payment_id,
            'client_id': self.client_id, 'amount': self.amount,
            'reason': self.reason, 'status': self.status,
            'processed_by': self.processed_by,
            'processed_at': self.processed_at.isoformat() if self.processed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'client_name': self.client.company_name if self.client else None,
            'payment_amount': self.payment.amount if self.payment else None,
        }


class AuditLog(db.Model):
    """Admin action audit trail"""
    __tablename__ = 'audit_logs'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    action = db.Column(db.String(100), nullable=False)
    entity_type = db.Column(db.String(50))
    entity_id = db.Column(db.Integer)
    details = db.Column(db.JSON)
    ip_address = db.Column(db.String(45))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', foreign_keys=[user_id])

    def to_dict(self):
        return {
            'id': self.id, 'user_id': self.user_id,
            'action': self.action, 'entity_type': self.entity_type,
            'entity_id': self.entity_id, 'details': self.details or {},
            'ip_address': self.ip_address,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'user_name': self.user.full_name or self.user.username if self.user else None,
        }


class Announcement(db.Model):
    """System-wide announcements"""
    __tablename__ = 'announcements'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(300), nullable=False)
    content = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(30), nullable=False, default='info')
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    target_audience = db.Column(db.String(30), nullable=False, default='all')
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    expires_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    creator = db.relationship('User', foreign_keys=[created_by])

    def to_dict(self):
        return {
            'id': self.id, 'title': self.title, 'content': self.content,
            'type': self.type, 'is_active': self.is_active,
            'target_audience': self.target_audience,
            'created_by': self.created_by,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'creator_name': self.creator.full_name or self.creator.username if self.creator else None,
        }


class SystemSetting(db.Model):
    """Key-value system settings"""
    __tablename__ = 'system_settings'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    setting_key = db.Column(db.String(100), unique=True, nullable=False)
    setting_value = db.Column(db.Text, nullable=False)
    updated_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'key': self.setting_key,
            'value': self.setting_value,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


class ChatMessage(db.Model):
    """Individual messages in HR chatbot conversations"""
    __tablename__ = 'chat_messages'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey('chat_conversations.id'), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'user' or 'assistant'
    content = db.Column(db.Text, nullable=False)
    retrieved_chunks = db.Column(db.Integer, default=0)  # Number of document chunks retrieved
    source_documents = db.Column(db.JSON)  # Referenced documents
    intent_analysis = db.Column(db.JSON)  # Detected intent and categories
    feedback_rating = db.Column(db.Integer)  # User rating: 1-5
    feedback_comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'conversation_id': self.conversation_id,
            'role': self.role,
            'content': self.content,
            'retrieved_chunks': self.retrieved_chunks,
            'source_documents': self.source_documents or [],
            'intent_analysis': self.intent_analysis or {},
            'feedback_rating': self.feedback_rating,
            'feedback_comment': self.feedback_comment,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

