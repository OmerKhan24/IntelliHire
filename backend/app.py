import os
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
from config.config import config
from models.models import db
from routes.api_routes import register_blueprints, init_services
from flask_jwt_extended import JWTManager
import logging
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Disable ChromaDB telemetry to avoid annoying errors
os.environ['ANONYMIZED_TELEMETRY'] = 'False'

def create_app(config_name='development'):
    """
    Application factory pattern for Flask app creation
    """
    app = Flask(__name__)
    
    # Disable strict slashes globally
    app.url_map.strict_slashes = False
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Setup logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Initialize extensions
    db.init_app(app)
    # JWT setup
    app.config.setdefault('JWT_SECRET_KEY', app.config.get('SECRET_KEY', 'change-me'))
    app.config['JWT_CSRF_CHECK_FORM'] = False
    app.config['JWT_COOKIE_CSRF_PROTECT'] = False
    jwt = JWTManager(app)
    
    # JWT error handlers
    @jwt.unauthorized_loader
    def unauthorized_callback(error_string):
        logging.warning(f"⚠️ Unauthorized access attempt: {error_string}")
        return jsonify({'error': 'Missing or invalid token', 'message': error_string}), 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error_string):
        logging.warning(f"⚠️ Invalid token: {error_string}")
        return jsonify({'error': 'Invalid token', 'message': error_string}), 422
    
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_data):
        logging.warning(f"⚠️ Expired token")
        return jsonify({'error': 'Token has expired'}), 401
    
    # Enhanced CORS configuration - Allow access from network devices and deployed frontend
    allowed_origins = [
        'http://localhost:3000',
        'http://192.168.100.80:3000',
        'http://127.0.0.1:3000',
        'http://192.168.100.80:5000',
    ]
    
    # Add production frontend URL from environment variable
    frontend_url = os.environ.get('FRONTEND_URL')
    if frontend_url:
        allowed_origins.append(frontend_url)
        # Also add https version if http is provided
        if frontend_url.startswith('http://'):
            allowed_origins.append(frontend_url.replace('http://', 'https://'))
    
    CORS(app, 
         origins=allowed_origins,
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
         allow_headers=['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
         expose_headers=['Content-Type', 'Authorization'],
         supports_credentials=True,
         max_age=3600)  # Cache preflight requests for 1 hour
    
    # Create upload directory
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Initialize AI services
    with app.app_context():
        try:
            init_services(app.config)
            logging.info("✅ AI services initialized")
        except Exception as e:
            logging.warning(f"⚠️ Services initialization failed: {e}")
    
    # Register API blueprints
    register_blueprints(app)
    
    # Create database tables
    with app.app_context():
        try:
            db.create_all()
            logging.info("✅ Database tables created")
        except Exception as e:
            logging.warning(f"⚠️ Database initialization failed: {e}")
            logging.info("📝 Note: Start XAMPP MySQL server and create 'intellihire_db' database")
    
    @app.route('/')
    def index():
        return {
            'message': 'IntelliHire API Server',
            'version': '1.0.0',
            'status': 'running',
            'endpoints': {
                'health': '/api/health',
                'jobs': '/api/jobs',
                'interviews': '/api/interviews',
                'reports': '/api/reports'
            }
        }
    
    @app.route('/health')
    def health_check():
        """Health check endpoint for Render and other deployment platforms"""
        try:
            # Check database connection
            db.session.execute('SELECT 1')
            db_status = 'connected'
        except Exception as e:
            db_status = f'error: {str(e)}'
        
        return {
            'status': 'healthy',
            'database': db_status,
            'timestamp': datetime.utcnow().isoformat()
        }, 200
    
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Endpoint not found'}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return {'error': 'Internal server error', 'message': str(error)}, 500
    
    return app

# Create app instance for gunicorn
app = create_app(os.environ.get('FLASK_ENV', 'production'))

if __name__ == '__main__':
    # Get environment configuration
    env = os.environ.get('FLASK_ENV', 'development')
    
    # Create app
    app = create_app(env)
    
    # Run development server
    print("🚀 Starting IntelliHire API Server...")
    print(f"📡 Server running on: http://localhost:5000")
    print(f"🌐 Frontend URL: http://localhost:3000")
    print(f"🔧 Environment: {env}")
    
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True,
        use_reloader=False  # Prevent double initialization of services
    )