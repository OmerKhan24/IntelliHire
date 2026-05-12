import os
import subprocess
import sys

# Fix MediaPipe protobuf compatibility issue - MUST be set before ANY imports
os.environ['PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION'] = 'python'

# Disable ChromaDB telemetry to avoid annoying errors
os.environ['ANONYMIZED_TELEMETRY'] = 'False'

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
    
    # Enhanced CORS configuration - Allow access from network devices
    _ALLOWED_ORIGINS = [
        'http://localhost:3000', 'http://127.0.0.1:3000',
        'http://localhost:3001', 'http://127.0.0.1:3001',
        'http://192.168.100.80:3000', 'http://192.168.100.80:5000',
        'http://192.168.18.9:3000', 'http://192.168.18.9:5000',
        'http://207.180.254.104', 'http://207.180.254.104:3000', 'http://207.180.254.104:3001',
        'https://intellihire.com.pk', 'https://www.intellihire.com.pk',
    ]
    CORS(app,
         origins=_ALLOWED_ORIGINS,
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
         allow_headers=['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
         expose_headers=['Content-Type', 'Authorization'],
         supports_credentials=True,
         automatic_options=True,
         max_age=3600)

    # Fallback: guarantee CORS headers on every response (covers JWT 401s, 405s, etc.)
    @app.after_request
    def _ensure_cors(response):
        origin = request.headers.get('Origin', '')
        if origin in _ALLOWED_ORIGINS:
            response.headers['Access-Control-Allow-Origin'] = origin
            response.headers['Access-Control-Allow-Credentials'] = 'true'
            response.headers['Vary'] = 'Origin'
            if request.method == 'OPTIONS':
                response.headers['Access-Control-Allow-Methods'] = \
                    'GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH'
                response.headers['Access-Control-Allow-Headers'] = \
                    'Content-Type, Authorization, X-Requested-With, Accept'
                response.headers['Access-Control-Max-Age'] = '3600'
        return response
    
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
    
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Endpoint not found'}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return {'error': 'Internal server error', 'message': str(error)}, 500
    
    return app

def _port_in_use(port: int) -> bool:
    """Return True if something is already listening on the given port."""
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex(('127.0.0.1', port)) == 0

if __name__ == '__main__':
    # Get environment configuration
    env = os.environ.get('FLASK_ENV', 'development')

    # Auto-start frontend servers (only in development, not when pm2 manages it)
    landing_process = None
    frontend_process = None
    if env == 'development' and os.environ.get('NO_FRONTEND') != '1':
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        root_dir = os.path.abspath(os.path.join(backend_dir, '..'))
        landing_dir = os.path.abspath(os.path.join(root_dir, '..', 'landing_page_mockup'))
        frontend_dir = os.path.abspath(os.path.join(root_dir, 'frontend'))

        # ── Next.js landing page (port 3001) ──────────────────────────────
        if os.path.isdir(landing_dir):
            if _port_in_use(3001):
                print("🌐  Landing page already running at: http://localhost:3001")
            else:
                print("🌐  Starting Next.js landing page...")
                try:
                    spawn_env = {**os.environ, 'PORT': '3001', 'BROWSER': 'none'}
                    if sys.platform == 'win32':
                        landing_process = subprocess.Popen(
                            'npm run dev -- -p 3001',
                            cwd=landing_dir,
                            shell=True,
                            env=spawn_env,
                            creationflags=subprocess.CREATE_NEW_PROCESS_GROUP,
                        )
                    else:
                        landing_process = subprocess.Popen(
                            ['npm', 'run', 'dev', '--', '-p', '3001'],
                            cwd=landing_dir,
                            env=spawn_env,
                        )
                    print(f"✅ Landing page starting at: http://localhost:3001")
                except Exception as e:
                    print(f"⚠️  Could not start landing page: {e}")

        # ── CRA app (port 3000) ───────────────────────────────────────────
        if os.path.isdir(frontend_dir):
            if _port_in_use(3000):
                print("🖥️   React app already running at:  http://localhost:3000")
            else:
                print("🖥️   Starting React app...")
                try:
                    # BROWSER=none  — don't open a tab
                    # CI=true       — suppress the "port in use, use another?" prompt
                    spawn_env = {**os.environ, 'BROWSER': 'none', 'CI': 'true'}
                    if sys.platform == 'win32':
                        frontend_process = subprocess.Popen(
                            'npm start',
                            cwd=frontend_dir,
                            shell=True,
                            env=spawn_env,
                            creationflags=subprocess.CREATE_NEW_PROCESS_GROUP,
                        )
                    else:
                        frontend_process = subprocess.Popen(
                            ['npm', 'start'],
                            cwd=frontend_dir,
                            env=spawn_env,
                        )
                    print(f"✅ App starting at: http://localhost:3000")
                except Exception as e:
                    print(f"⚠️  Could not start frontend app: {e}")

    # Create app
    app = create_app(env)

    # Run development server
    print("🚀 Starting IntelliHire API Server...")
    print(f"📡 API running on:      http://localhost:5000")
    print(f"🌐 Landing page:        http://localhost:3001")
    print(f"🖥️   React app:          http://localhost:3000")
    print(f"🔧 Environment: {env}")

    try:
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=True,
            use_reloader=False  # Prevent double initialization of services
        )
    finally:
        if frontend_process:
            frontend_process.terminate()
        if landing_process:
            landing_process.terminate()