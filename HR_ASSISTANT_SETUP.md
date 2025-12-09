# HR Assistant Module - Setup Guide

## Overview
The HR Assistant is an AI-powered chatbot that helps employees and candidates access company policies, HR information, and onboarding materials. It uses RAG (Retrieval Augmented Generation) to provide accurate, context-aware responses based on uploaded company documents.

## Architecture

### Backend Components
1. **hr_rag_service.py** - Document processing and vector search
   - Extracts text from PDF, DOCX, TXT files
   - Chunks documents into semantic segments
   - Stores embeddings in ChromaDB for fast retrieval
   - Provides semantic search capabilities

2. **hr_chatbot_service.py** - AI chatbot interface
   - Integrates with Google Gemini AI
   - Retrieves relevant document context using RAG
   - Generates natural, contextual responses
   - Analyzes query intent and provides suggestions

3. **hr_routes.py** - REST API endpoints
   - Document upload/management (JWT protected)
   - Chat message handling
   - Conversation tracking
   - Statistics and analytics

4. **Database Models**
   - HRDocument - Document metadata and storage info
   - ChatConversation - User chat sessions
   - ChatMessage - Individual messages with sources

### Frontend Components
1. **HRAssistant.js** - Main interface
   - Chat tab with message history
   - Document management tab
   - Upload dialog with form validation
   - Real-time stats display

2. **API Integration** (api.js)
   - HR endpoint group with 9 methods
   - Handles file uploads and chat requests
   - JWT token authentication

## Installation Steps

### 1. Backend Setup

#### Install Python Dependencies
```bash
cd backend
pip install PyPDF2==3.0.1 chromadb==0.4.22 langchain==0.1.6 langchain-community==0.0.20 sentence-transformers==2.3.1 tiktoken==0.5.2 pydantic==2.6.0
```

#### Create Required Directories
These directories are already created:
- `backend/uploads/hr_documents/` - Stores uploaded files
- `backend/chroma_db/` - Vector database storage

#### Database Migration
Run the SQL migration to create required tables:

**File:** `database/hr_chatbot_migration.sql`

Execute in phpMyAdmin or MySQL CLI:
```bash
mysql -u your_user -p intellihire_db < database/hr_chatbot_migration.sql
```

Or copy the contents and run in phpMyAdmin SQL tab.

**Tables Created:**
- `hr_documents` - Document metadata
- `chat_conversations` - Chat sessions
- `chat_messages` - Message history

#### Configure Environment Variables
Add to your `.env` file:
```env
# HR Assistant Settings
HR_DOCUMENTS_PATH=uploads/hr_documents
CHROMA_DB_PATH=chroma_db
CHROMA_COLLECTION_NAME=hr_documents

# Already exists (Gemini AI)
GEMINI_API_KEY=your_gemini_api_key
```

### 2. Frontend Setup

#### Install Node Dependencies (if needed)
The required dependencies are already in package.json:
```bash
cd frontend
npm install
```

#### Verify Files
Ensure these files exist:
- `frontend/src/pages/HRAssistant.js` ✓
- `frontend/src/services/api.js` (updated) ✓
- `frontend/src/App.tsx` (updated with route) ✓

### 3. Start the Application

#### Backend
```bash
cd backend
python app.py
```

**Verify startup logs:**
```
✅ HR services (RAG + Chatbot) initialized successfully
✅ HR routes registered
```

#### Frontend
```bash
cd frontend
npm start
```

## Usage Guide

### For Interviewers/HR Staff

#### Accessing the Module
1. Login with interviewer credentials
2. Navigate to Interview Dashboard
3. Click "HR Assistant" button (top right)

#### Uploading Documents
1. Go to "Document Management" tab
2. Click "Upload Document" button
3. Fill in the form:
   - **File**: Select PDF, DOCX, or TXT file
   - **Title**: Descriptive name (e.g., "Leave Policy 2024")
   - **Description**: Brief summary
   - **Category**: Choose from:
     - Policy (company policies)
     - Procedure (how-to guides)
     - Benefits (compensation, perks)
     - Onboarding (new hire materials)
     - General (other HR info)
   - **Tags**: Optional keywords for search
4. Click "Upload"

**Supported File Types:**
- PDF (.pdf)
- Word Documents (.docx, .doc)
- Text Files (.txt)

**File Size Limit:** 10MB per document

#### Managing Documents
- **View**: See all uploaded documents with metadata
- **Delete**: Remove documents (confirmation required)
- **Stats**: Monitor total documents, chunks, categories

### For All Users

#### Using the Chatbot
1. Go to "Chat Assistant" tab
2. Type your question in the input box
3. Press Enter or click "Send"

**Sample Questions:**
- "What is the leave policy?"
- "How do I apply for vacation?"
- "What benefits does the company offer?"
- "What is the onboarding process?"
- "Explain the remote work policy"

**Features:**
- **Context-Aware**: Retrieves relevant documents before answering
- **Source Citations**: Shows which documents were used
- **Conversation History**: Maintains context across messages
- **Suggested Questions**: Click chips for common queries
- **Real-time Responses**: Streams AI-generated answers

#### Chat Interface Tips
- Ask specific questions for best results
- Review source documents for detailed info
- Use suggested questions to discover capabilities
- Sessions are saved automatically

## API Endpoints

### Document Management

#### Upload Document
```http
POST /api/hr/documents/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <file>
title: string
description: string (optional)
category: policy|procedure|benefits|onboarding|general
tags: string (comma-separated, optional)
```

#### List Documents
```http
GET /api/hr/documents
Authorization: Bearer <token>
Query Params: category, tags, search
```

#### Get Document
```http
GET /api/hr/documents/<id>
Authorization: Bearer <token>
```

#### Delete Document
```http
DELETE /api/hr/documents/<id>
Authorization: Bearer <token>
```

#### Document Statistics
```http
GET /api/hr/documents/stats
Authorization: Bearer <token>
```

### Chat Endpoints

#### Send Message
```http
POST /api/hr/chat/message
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "What is the leave policy?",
  "session_id": "uuid" (optional, creates new if not provided)
}

Response:
{
  "message": {
    "id": 123,
    "role": "assistant",
    "content": "...",
    "sources": [...],
    "has_context": true
  },
  "session_id": "uuid"
}
```

#### Get Conversations
```http
GET /api/hr/chat/conversations
Authorization: Bearer <token>
```

#### Get Conversation
```http
GET /api/hr/chat/conversations/<session_id>
Authorization: Bearer <token>
```

#### Get Suggestions
```http
GET /api/hr/chat/suggestions
Query Params: category (optional)
```

#### Submit Feedback
```http
POST /api/hr/chat/feedback
Authorization: Bearer <token>
Content-Type: application/json

{
  "message_id": 123,
  "rating": 5,
  "comment": "Helpful response"
}
```

## Technical Details

### RAG Pipeline

1. **Document Ingestion**
   - File uploaded via API
   - Text extracted (PyPDF2, python-docx)
   - Document saved to filesystem

2. **Chunking**
   - Text split into 500-character chunks
   - 50-character overlap between chunks
   - Preserves semantic context

3. **Embedding**
   - Uses sentence-transformers (all-MiniLM-L6-v2)
   - 384-dimensional vectors
   - Stored in ChromaDB

4. **Retrieval**
   - Query embedded using same model
   - Top 5 most relevant chunks retrieved
   - Cosine similarity search

5. **Generation**
   - Relevant chunks passed as context
   - Gemini AI generates response
   - Sources cited in output

### Vector Database (ChromaDB)

**Location:** `backend/chroma_db/`
**Collection:** hr_documents
**Distance Metric:** Cosine similarity

**Metadata Stored:**
- document_id (links to database)
- title
- category
- tags
- chunk_index

### Security

- **JWT Authentication**: Required for all endpoints
- **Role-Based Access**: Interviewers can upload, all can chat
- **File Validation**: Type and size checks
- **SQL Injection Protection**: Parameterized queries
- **XSS Prevention**: Input sanitization

## Troubleshooting

### Backend Issues

#### ChromaDB Initialization Failed
```
Error: Could not initialize ChromaDB
```
**Solution:**
- Ensure `chroma_db/` directory exists and is writable
- Check Python dependencies installed correctly
- Verify no port conflicts on 8000

#### Embedding Model Download
First run downloads the model (~80MB). If it fails:
```bash
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')"
```

#### Document Upload Fails
```
Error: Failed to process document
```
**Check:**
- File size under 10MB
- File format is PDF, DOCX, or TXT
- Upload directory exists and is writable
- Sufficient disk space

#### Gemini API Error
```
Error: Gemini API request failed
```
**Solution:**
- Verify GEMINI_API_KEY in .env
- Check API quota/limits
- Ensure internet connectivity

### Frontend Issues

#### Navigation Not Working
- Clear browser cache
- Check React Router setup in App.tsx
- Verify route protection in ProtectedRoute.js

#### API Calls Failing
- Check JWT token in localStorage
- Verify backend is running
- Check CORS configuration
- Inspect Network tab in DevTools

#### File Upload Not Responding
- Check file size
- Verify FormData construction
- Check browser console for errors

### Database Issues

#### Tables Not Created
Run migration manually:
```sql
USE intellihire_db;
SOURCE database/hr_chatbot_migration.sql;
```

#### Foreign Key Constraint Error
Ensure `users` table exists with `id` column:
```sql
DESCRIBE users;
```

## Performance Optimization

### Backend
- **Embedding Cache**: Models loaded once at startup
- **Connection Pooling**: SQLAlchemy manages DB connections
- **Async Processing**: Could add Celery for large uploads

### Frontend
- **Lazy Loading**: HRAssistant loads on route access
- **Debouncing**: Implement for search inputs
- **Pagination**: Add for large document lists

### Database
- **Indexes**: Already on document_id, session_id
- **Query Optimization**: Use SELECT with specific columns
- **Archive Old Conversations**: Implement cleanup job

## Monitoring

### Logs
Backend logs to console and `logs/` directory:
- Document uploads
- Chat interactions
- RAG retrievals
- Errors and warnings

### Metrics to Track
- Documents uploaded per day
- Chat messages per user
- Average retrieval time
- User satisfaction ratings
- Most queried topics

## Future Enhancements

1. **Multi-language Support**: Translate documents and responses
2. **Voice Interface**: Add speech-to-text for queries
3. **Admin Analytics**: Dashboard for usage metrics
4. **Document Versioning**: Track policy updates
5. **Scheduled Updates**: Auto-refresh document index
6. **Advanced Search**: Filters, date ranges, full-text
7. **Export Conversations**: PDF/CSV download
8. **Integration**: Slack/Teams bot
9. **Feedback Loop**: Use ratings to improve responses
10. **Knowledge Graph**: Entity relationships in documents

## Support

### Getting Help
- Check logs in `backend/logs/`
- Review error messages in browser console
- Consult API documentation above
- Test endpoints with Postman/curl

### Common Commands

**Test HR Services:**
```bash
python backend/services/hr_rag_service.py
python backend/services/hr_chatbot_service.py
```

**Clear ChromaDB (fresh start):**
```bash
rm -rf backend/chroma_db/*
# Restart backend to reinitialize
```

**Database Reset:**
```sql
DROP TABLE chat_messages;
DROP TABLE chat_conversations;
DROP TABLE hr_documents;
# Then run migration again
```

## Conclusion

The HR Assistant module is now fully integrated into IntelliHire. Interviewers can upload company documents, and all users can interact with the AI chatbot to get instant answers about HR policies and procedures.

**Key Features:**
✅ RAG-based document retrieval
✅ AI chatbot with Gemini
✅ Document management interface
✅ Conversation tracking
✅ Source citations
✅ JWT authentication
✅ Material-UI interface

**Next Steps:**
1. Install Python dependencies
2. Run database migration
3. Start backend and verify logs
4. Upload your first document
5. Test the chatbot

Happy coding! 🚀
