from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash


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
    status = db.Column(db.String(20), default='active')
    scoring_criteria = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    interviews = db.relationship('Interview', backref='job', lazy=True, cascade='all, delete-orphan')
    creator = db.relationship('User', foreign_keys=[created_by], backref='jobs_created')
    
    def to_dict(self):
        return {
            'id': self.id, 
            'title': self.title, 
            'description': self.description, 
            'requirements': self.requirements, 
            'duration_minutes': self.duration_minutes, 
            'created_by': self.created_by, 
            'status': self.status,
            'is_active': self.status == 'active',
            'scoring_criteria': self.scoring_criteria or {}, 
            'created_at': self.created_at.isoformat() if self.created_at else None, 
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'interviews': [interview.to_dict() for interview in self.interviews]
        }


class Interview(db.Model):
    __tablename__ = 'interviews'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)
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
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    responses = db.relationship('Response', backref='question', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {'id': self.id, 'interview_id': self.interview_id, 'question': self.question, 'question_type': self.question_type, 'difficulty_level': self.difficulty_level, 'expected_duration': self.expected_duration, 'order_index': self.order_index, 'ai_context': self.ai_context or {}, 'created_at': self.created_at.isoformat() if self.created_at else None}


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

