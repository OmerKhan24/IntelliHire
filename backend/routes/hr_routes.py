"""
HR Chatbot and Document Management Routes
Handles document upload for HR officials and chatbot queries for employees/candidates
"""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
import uuid
from datetime import datetime
from models.models import db, User, HRDocument, ChatConversation, ChatMessage
from services.hr_rag_service import HRDocumentRAGService
from services.hr_chatbot_service import HRChatbotService
import logging

logger = logging.getLogger(__name__)

# Create Blueprint
hr_blueprint = Blueprint('hr', __name__, url_prefix='/api/hr')

# Global service instances (initialized in init_hr_services)
hr_rag_service = None
hr_chatbot_service = None


def init_hr_services(config):
    """Initialize HR services with app configuration"""
    global hr_rag_service, hr_chatbot_service
    
    try:
        # Setup upload folder for HR documents
        hr_docs_folder = os.path.join(config['UPLOAD_FOLDER'], 'hr_documents')
        os.makedirs(hr_docs_folder, exist_ok=True)
        
        # Initialize RAG service
        hr_rag_service = HRDocumentRAGService(
            upload_folder=hr_docs_folder,
            embedding_model="all-MiniLM-L6-v2"
        )
        
        # Initialize chatbot service with GitHub token
        github_token = os.getenv('GITHUB_TOKEN_HR')
        if not github_token:
            raise ValueError("GITHUB_TOKEN_HR not found in environment")
        
        hr_chatbot_service = HRChatbotService(
            github_token=github_token,
            rag_service=hr_rag_service
        )
        
        logger.info("✅ HR services initialized successfully")
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize HR services: {e}")
        raise


# ==================== DOCUMENT MANAGEMENT ROUTES (HR Officials) ====================

@hr_blueprint.route('/documents/upload', methods=['POST'])
@jwt_required()
def upload_hr_document():
    """
    Upload HR policy document (PDF, DOCX, TXT)
    Role: HR officials/Admin only
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Check authorization (only admin and HR roles)
        if user.role not in ['admin', 'interviewer']:  # 'interviewer' acts as HR in this context
            return jsonify({'error': 'Unauthorized. Only HR officials can upload documents.'}), 403
        
        # Validate request
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Get metadata from form
        title = request.form.get('title', file.filename)
        description = request.form.get('description', '')
        category = request.form.get('category', 'general')
        tags = request.form.get('tags', '').split(',') if request.form.get('tags') else []
        
        # Validate file type
        allowed_extensions = {'pdf', 'docx', 'doc', 'txt'}
        file_ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
        
        if file_ext not in allowed_extensions:
            return jsonify({'error': f'Invalid file type. Allowed: {", ".join(allowed_extensions)}'}), 400
        
        # Secure filename
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_filename = f"{timestamp}_{filename}"
        
        # Save file
        hr_docs_folder = os.path.join(current_app.config['UPLOAD_FOLDER'], 'hr_documents')
        file_path = os.path.join(hr_docs_folder, unique_filename)
        file.save(file_path)
        
        file_size = os.path.getsize(file_path)
        
        logger.info(f"📁 File saved: {file_path}")
        
        # Process document with RAG service
        # Convert tags list to string for ChromaDB (only accepts primitives)
        metadata = {
            'title': title,
            'description': description,
            'category': category,
            'uploaded_by': user.full_name or user.username,
            'tags': ','.join([t.strip() for t in tags if t.strip()]) if tags else ''
        }
        
        rag_result = hr_rag_service.process_and_store_document(
            file_path=file_path,
            metadata=metadata
        )
        
        # Save to database
        hr_doc = HRDocument(
            title=title,
            description=description,
            category=category,
            file_path=file_path,
            file_type=file_ext,
            file_size=file_size,
            document_id=rag_result['document_id'],
            uploaded_by=current_user_id,
            tags=tags,
            is_active=True,
            version=1
        )
        
        db.session.add(hr_doc)
        db.session.commit()
        
        logger.info(f"✅ Document uploaded and indexed: {rag_result['document_id']}")
        
        return jsonify({
            'message': 'Document uploaded and processed successfully',
            'document': hr_doc.to_dict(),
            'processing_info': {
                'chunks_created': rag_result['chunks_created'],
                'characters_processed': rag_result['characters_processed']
            }
        }), 201
        
    except Exception as e:
        logger.error(f"❌ Error uploading document: {e}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@hr_blueprint.route('/documents', methods=['GET'])
@jwt_required()
def list_hr_documents():
    """
    List all HR documents
    Role: All authenticated users
    """
    try:
        # Optional filters
        category = request.args.get('category')
        is_active = request.args.get('is_active', 'true').lower() == 'true'
        
        # Build query
        query = HRDocument.query
        
        if category:
            query = query.filter_by(category=category)
        
        query = query.filter_by(is_active=is_active)
        
        # Order by most recent
        documents = query.order_by(HRDocument.created_at.desc()).all()
        
        return jsonify({
            'documents': [doc.to_dict() for doc in documents],
            'total': len(documents)
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error listing documents: {e}")
        return jsonify({'error': str(e)}), 500


@hr_blueprint.route('/documents/<int:doc_id>', methods=['GET'])
@jwt_required()
def get_hr_document(doc_id):
    """Get single document details"""
    try:
        document = HRDocument.query.get(doc_id)
        
        if not document:
            return jsonify({'error': 'Document not found'}), 404
        
        return jsonify(document.to_dict()), 200
        
    except Exception as e:
        logger.error(f"❌ Error fetching document: {e}")
        return jsonify({'error': str(e)}), 500


@hr_blueprint.route('/documents/<int:doc_id>', methods=['DELETE'])
@jwt_required()
def delete_hr_document(doc_id):
    """
    Delete HR document
    Role: HR officials/Admin only
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Check authorization
        if user.role not in ['admin', 'interviewer']:
            return jsonify({'error': 'Unauthorized'}), 403
        
        document = HRDocument.query.get(doc_id)
        
        if not document:
            return jsonify({'error': 'Document not found'}), 404
        
        # Delete from vector database
        hr_rag_service.delete_document(document.document_id)
        
        # Delete file
        if os.path.exists(document.file_path):
            os.remove(document.file_path)
        
        # Delete from database
        db.session.delete(document)
        db.session.commit()
        
        logger.info(f"🗑️ Deleted document: {document.title}")
        
        return jsonify({'message': 'Document deleted successfully'}), 200
        
    except Exception as e:
        logger.error(f"❌ Error deleting document: {e}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@hr_blueprint.route('/documents/stats', methods=['GET'])
@jwt_required()
def get_documents_stats():
    """Get document collection statistics"""
    try:
        # Get stats from RAG service
        rag_stats = hr_rag_service.get_collection_stats()
        
        # Get stats from database
        total_docs = HRDocument.query.filter_by(is_active=True).count()
        categories = db.session.query(
            HRDocument.category,
            db.func.count(HRDocument.id)
        ).filter_by(is_active=True).group_by(HRDocument.category).all()
        
        category_counts = {cat: count for cat, count in categories}
        
        return jsonify({
            'database': {
                'total_documents': total_docs,
                'categories': category_counts
            },
            'vector_store': rag_stats
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error fetching stats: {e}")
        return jsonify({'error': str(e)}), 500


# ==================== CHATBOT ROUTES (Employees & Candidates) ====================

@hr_blueprint.route('/chat/message', methods=['POST'])
@jwt_required()
def send_chat_message():
    """
    Send message to HR chatbot and get AI response
    Role: All authenticated users
    """
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate input
        if not data or 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
        
        user_message = data['message'].strip()
        session_id = data.get('session_id')
        
        if not user_message:
            return jsonify({'error': 'Message cannot be empty'}), 400
        
        # Get or create conversation
        if session_id:
            conversation = ChatConversation.query.filter_by(
                session_id=session_id,
                user_id=current_user_id
            ).first()
        else:
            conversation = None
        
        if not conversation:
            # Create new conversation
            session_id = str(uuid.uuid4())
            conversation = ChatConversation(
                user_id=current_user_id,
                session_id=session_id,
                title=user_message[:50] + '...' if len(user_message) > 50 else user_message,
                is_active=True
            )
            db.session.add(conversation)
            db.session.flush()  # Get conversation ID
        
        # Get conversation history
        history_messages = ChatMessage.query.filter_by(
            conversation_id=conversation.id
        ).order_by(ChatMessage.created_at.asc()).all()
        
        conversation_history = [
            {'role': msg.role, 'content': msg.content}
            for msg in history_messages[-6:]  # Last 6 messages (3 exchanges)
        ]
        
        # Analyze query intent
        intent_analysis = hr_chatbot_service.analyze_query_intent(user_message)
        
        # Save user message
        user_msg = ChatMessage(
            conversation_id=conversation.id,
            role='user',
            content=user_message,
            intent_analysis=intent_analysis
        )
        db.session.add(user_msg)
        
        # Generate AI response (synchronous call)
        response_data = hr_chatbot_service.generate_response(
            user_query=user_message,
            user_id=str(current_user_id),
            conversation_history=conversation_history
        )
        
        # Save assistant message
        assistant_msg = ChatMessage(
            conversation_id=conversation.id,
            role='assistant',
            content=response_data['response'],
            retrieved_chunks=response_data['retrieved_chunks'],
            source_documents=response_data['sources']
        )
        db.session.add(assistant_msg)
        
        # Update conversation last message time
        conversation.last_message_at = datetime.utcnow()
        
        db.session.commit()
        
        logger.info(f"💬 Chat message processed for user {current_user_id}")
        
        return jsonify({
            'session_id': session_id,
            'conversation_id': conversation.id,
            'message': {
                'id': assistant_msg.id,
                'content': response_data['response'],
                'sources': response_data['sources'],
                'has_context': response_data['has_context']
            },
            'intent': intent_analysis
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error processing chat message: {e}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@hr_blueprint.route('/chat/conversations', methods=['GET'])
@jwt_required()
def get_user_conversations():
    """Get user's chat conversation history"""
    try:
        current_user_id = get_jwt_identity()
        
        conversations = ChatConversation.query.filter_by(
            user_id=current_user_id,
            is_active=True
        ).order_by(ChatConversation.last_message_at.desc()).all()
        
        return jsonify({
            'conversations': [conv.to_dict() for conv in conversations],
            'total': len(conversations)
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error fetching conversations: {e}")
        return jsonify({'error': str(e)}), 500


@hr_blueprint.route('/chat/conversations/<int:conversation_id>', methods=['GET'])
@jwt_required()
def get_conversation_detail(conversation_id):
    """Get conversation with all messages"""
    try:
        current_user_id = get_jwt_identity()
        
        conversation = ChatConversation.query.filter_by(
            id=conversation_id,
            user_id=current_user_id
        ).first()
        
        if not conversation:
            return jsonify({'error': 'Conversation not found'}), 404
        
        return jsonify(conversation.to_dict(include_messages=True)), 200
        
    except Exception as e:
        logger.error(f"❌ Error fetching conversation: {e}")
        return jsonify({'error': str(e)}), 500


@hr_blueprint.route('/chat/suggestions', methods=['GET'])
@jwt_required()
def get_suggested_questions():
    """Get suggested questions for users"""
    try:
        category = request.args.get('category')
        suggestions = hr_chatbot_service.get_suggested_questions(category)
        
        return jsonify({
            'suggestions': suggestions,
            'category': category or 'all'
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error fetching suggestions: {e}")
        return jsonify({'error': str(e)}), 500


@hr_blueprint.route('/chat/feedback', methods=['POST'])
@jwt_required()
def submit_message_feedback():
    """Submit feedback for a chatbot response"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        message_id = data.get('message_id')
        rating = data.get('rating')  # 1-5
        comment = data.get('comment', '')
        
        if not message_id or not rating:
            return jsonify({'error': 'message_id and rating are required'}), 400
        
        message = ChatMessage.query.get(message_id)
        
        if not message:
            return jsonify({'error': 'Message not found'}), 404
        
        # Verify ownership
        conversation = ChatConversation.query.get(message.conversation_id)
        if conversation.user_id != current_user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Update feedback
        message.feedback_rating = rating
        message.feedback_comment = comment
        
        db.session.commit()
        
        return jsonify({'message': 'Feedback submitted successfully'}), 200
        
    except Exception as e:
        logger.error(f"❌ Error submitting feedback: {e}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ==================== EMPLOYEE MANAGEMENT ROUTES (HR Officials) ====================

@hr_blueprint.route('/employees/register', methods=['POST'])
@jwt_required()
def register_employee():
    """
    Register a new employee (HR officials only)
    Role: HR officials/Admin only
    """
    from werkzeug.security import generate_password_hash
    
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Check authorization (only admin and HR roles)
        if user.role not in ['admin', 'interviewer']:
            return jsonify({'error': 'Unauthorized. Only HR officials can register employees.'}), 403
        
        # Get employee data
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        required_fields = ['username', 'email', 'password', 'full_name']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
        
        # Check if username or email already exists
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already exists'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already exists'}), 400
        
        # Create new employee
        new_employee = User(
            username=data['username'],
            email=data['email'],
            password_hash=generate_password_hash(data['password']),
            full_name=data['full_name'],
            role='employee',
            phone=data.get('phone', ''),
            is_active=True
        )
        
        db.session.add(new_employee)
        db.session.commit()
        
        logger.info(f"✅ Employee registered: {new_employee.username} by HR: {user.username}")
        
        return jsonify({
            'message': 'Employee registered successfully',
            'employee': {
                'id': new_employee.id,
                'username': new_employee.username,
                'email': new_employee.email,
                'full_name': new_employee.full_name,
                'role': new_employee.role,
                'created_at': new_employee.created_at.isoformat() if new_employee.created_at else None
            }
        }), 201
        
    except Exception as e:
        logger.error(f"❌ Error registering employee: {e}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@hr_blueprint.route('/employees', methods=['GET'])
@jwt_required()
def get_employees():
    """
    Get list of all employees (HR officials only)
    Role: HR officials/Admin only
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Check authorization (only admin and HR roles)
        if user.role not in ['admin', 'interviewer']:
            return jsonify({'error': 'Unauthorized. Only HR officials can view employees.'}), 403
        
        # Get all employees
        employees = User.query.filter_by(role='employee').order_by(User.created_at.desc()).all()
        
        return jsonify({
            'employees': [{
                'id': emp.id,
                'username': emp.username,
                'email': emp.email,
                'full_name': emp.full_name,
                'phone': emp.phone,
                'is_active': emp.is_active,
                'created_at': emp.created_at.isoformat() if emp.created_at else None
            } for emp in employees],
            'total': len(employees)
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error fetching employees: {e}")
        return jsonify({'error': str(e)}), 500


@hr_blueprint.route('/employees/<int:employee_id>', methods=['PUT'])
@jwt_required()
def update_employee_status(employee_id):
    """
    Update employee status (activate/deactivate) - HR officials only
    Role: HR officials/Admin only
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Check authorization (only admin and HR roles)
        if user.role not in ['admin', 'interviewer']:
            return jsonify({'error': 'Unauthorized. Only HR officials can update employees.'}), 403
        
        # Get employee
        employee = User.query.get(employee_id)
        
        if not employee or employee.role != 'employee':
            return jsonify({'error': 'Employee not found'}), 404
        
        # Get update data
        data = request.get_json()
        
        if 'is_active' in data:
            employee.is_active = bool(data['is_active'])
        
        if 'full_name' in data:
            employee.full_name = data['full_name']
        
        if 'email' in data:
            # Check if email already exists (excluding current employee)
            existing = User.query.filter(User.email == data['email'], User.id != employee_id).first()
            if existing:
                return jsonify({'error': 'Email already exists'}), 400
            employee.email = data['email']
        
        if 'phone' in data:
            employee.phone = data['phone']
        
        db.session.commit()
        
        logger.info(f"✅ Employee updated: {employee.username} by HR: {user.username}")
        
        return jsonify({
            'message': 'Employee updated successfully',
            'employee': {
                'id': employee.id,
                'username': employee.username,
                'email': employee.email,
                'full_name': employee.full_name,
                'phone': employee.phone,
                'is_active': employee.is_active
            }
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error updating employee: {e}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ==================== EMPLOYEE STATS ROUTE ====================

@hr_blueprint.route('/employees/stats', methods=['GET'])
@jwt_required()
def get_employee_stats():
    """
    Get statistics for the logged-in employee
    Role: Employees (and HR/Admin)
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get conversation count
        total_conversations = ChatConversation.query.filter_by(user_id=current_user_id).count()
        
        # Get total questions asked (only count user messages, not assistant responses)
        questions_asked = db.session.query(db.func.count(ChatMessage.id)).join(
            ChatConversation
        ).filter(
            ChatConversation.user_id == current_user_id,
            ChatMessage.role == 'user'
        ).scalar() or 0
        
        # Get last active date
        last_conversation = ChatConversation.query.filter_by(
            user_id=current_user_id
        ).order_by(ChatConversation.last_message_at.desc()).first()
        
        last_active = last_conversation.last_message_at if last_conversation else user.created_at
        
        return jsonify({
            'total_chats': total_conversations,
            'questions_asked': questions_asked,
            'last_active': last_active.isoformat() if last_active else None,
            'employee_since': user.created_at.isoformat() if user.created_at else None
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error fetching employee stats: {e}")
        return jsonify({'error': str(e)}), 500
