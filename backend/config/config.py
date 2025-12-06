import os
from datetime import timedelta

class Config:
    """Base configuration class"""
    
    # Flask Configuration
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'intellihire-dev-secret-key-2025'
    DEBUG = False
    
    # Database Configuration
    # Support both MySQL (local) and PostgreSQL (production)
    database_url = os.environ.get('DATABASE_URL')
    
    if database_url:
        # Production: Use DATABASE_URL from environment
        # Render uses postgres://, but SQLAlchemy needs postgresql://
        if database_url.startswith('postgres://'):
            database_url = database_url.replace('postgres://', 'postgresql://', 1)
        SQLALCHEMY_DATABASE_URI = database_url
    else:
        # Development: Use local MySQL (change 'intellihire_db' to 'intellihire_dev' if needed)
        SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URI') or \
            'mysql+pymysql://root:@localhost/intellihire_dev'
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_recycle': 300,
        'pool_pre_ping': True
    }
    
    # File Upload Configuration
    UPLOAD_FOLDER = 'uploads'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'txt'}
    
    # AI API Keys
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
    GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY') or 'AIzaSyBqOr81H2O5eGjGhKcZk9urE2SAfnTMTAI'
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY') or 'AIzaSyBqOr81H2O5eGjGhKcZk9urE2SAfnTMTAI'
    GITHUB_TOKEN = os.environ.get('GITHUB_TOKEN')  # GitHub Copilot API for question generation/scoring
    ELEVENLABS_API_KEY = os.environ.get('ELEVENLABS_API_KEY')
    
    # Gemini Configuration
    GEMINI_MODEL = 'gemini-pro'
    GEMINI_VISION_MODEL = 'gemini-pro-vision'
    GEMINI_TTS_MODEL = 'text-to-speech'
    GEMINI_STT_MODEL = 'speech-to-text'
    GEMINI_GENERATION_CONFIG = {
        'temperature': 0.7,
        'top_p': 0.95,
        'top_k': 64,
        'max_output_tokens': 8192,
    }
    
    # TTS Configuration
    TTS_VOICE_NAME = "en-US-Wavenet-D"  # Google TTS voice
    TTS_LANGUAGE_CODE = "en-US"
    TTS_AUDIO_FORMAT = "mp3"
    TTS_SPEAKING_RATE = 1.0
    TTS_PITCH = 0.0
    
    # STT Configuration  
    STT_LANGUAGE_CODE = "en-US"
    STT_SAMPLE_RATE = 16000
    STT_ENCODING = "WEBM_OPUS"  # For web audio
    STT_ENABLE_AUTOMATIC_PUNCTUATION = True
    STT_ENABLE_WORD_TIME_OFFSETS = True
    
    # Interview Configuration
    DEFAULT_INTERVIEW_DURATION = 20  # minutes
    MAX_INTERVIEW_DURATION = 60     # minutes
    MIN_INTERVIEW_DURATION = 5      # minutes
    
    # Video Analysis Settings
    FRAME_ANALYSIS_INTERVAL = 30    # Analyze every 30th frame
    MOBILE_DETECTION_CONFIDENCE = 0.7
    GAZE_DEVIATION_THRESHOLD = 0.3
    
    # Audio Processing
    AUDIO_SAMPLE_RATE = 16000
    AUDIO_CHUNK_SIZE = 1024
    SPEECH_TIMEOUT = 5  # seconds
    
    # RAG Configuration
    CHUNK_SIZE = 1000
    CHUNK_OVERLAP = 200
    VECTOR_STORE_PATH = 'data/vectorstore'
    
    # HR Assistant Configuration
    HR_DOCUMENTS_PATH = os.environ.get('HR_DOCUMENTS_PATH') or 'uploads/hr_documents'
    CHROMA_DB_PATH = os.environ.get('CHROMA_DB_PATH') or 'chroma_db'
    CHROMA_COLLECTION_NAME = os.environ.get('CHROMA_COLLECTION_NAME') or 'hr_documents'
    HR_CHUNK_SIZE = 500  # Smaller chunks for precise HR info
    HR_CHUNK_OVERLAP = 50
    HR_TOP_K_RESULTS = 5  # Number of relevant chunks to retrieve
    
    # Scoring Configuration
    SCORING_WEIGHTS = {
        'content_quality': 0.4,
        'communication_skills': 0.25,
        'technical_knowledge': 0.25,
        'behavioral_indicators': 0.1
    }

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('DEV_DATABASE_URL') or \
        'mysql+pymysql://root:@localhost/intellihire_dev'

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}