# HR Chatbot & Document Management System - Implementation Guide

## 📋 Overview

This module integrates an AI-powered HR Assistant chatbot into IntelliHire, enabling:
- **HR Officials**: Upload company policies, procedures, and documents
- **Employees/Candidates**: Chat with AI assistant to get answers about company policies, benefits, onboarding, etc.
- **RAG Technology**: Retrieval-Augmented Generation ensures accurate, document-based responses

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     IntelliHire Platform                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐         ┌──────────────┐                  │
│  │  HR Official │         │   Employee   │                  │
│  │   (Admin)    │         │  (User/Can.) │                  │
│  └──────┬───────┘         └──────┬───────┘                  │
│         │                        │                           │
│         │ Upload Documents       │ Ask Questions             │
│         ↓                        ↓                           │
│  ┌──────────────────────────────────────────┐               │
│  │        Flask API Routes (hr_routes.py)    │               │
│  └──────────────────┬───────────────────────┘               │
│                     │                                        │
│         ┌───────────┴───────────┐                           │
│         ↓                       ↓                           │
│  ┌──────────────┐        ┌──────────────┐                  │
│  │  HR RAG      │        │  HR Chatbot  │                  │
│  │  Service     │←───────│  Service     │                  │
│  └──────┬───────┘        └──────────────┘                  │
│         │                       ↓                           │
│         │                 ┌──────────┐                      │
│         │                 │ Gemini   │                      │
│         │                 │   AI     │                      │
│         │                 └──────────┘                      │
│         ↓                                                    │
│  ┌──────────────┐                                           │
│  │   ChromaDB   │  (Vector Database)                        │
│  │   Embeddings │                                           │
│  └──────────────┘                                           │
│         ↓                                                    │
│  ┌──────────────┐                                           │
│  │   MySQL DB   │  (Document metadata, chat history)        │
│  └──────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
```

## 🔑 Key Components

### 1. **HR Document RAG Service** (`hr_rag_service.py`)
- **Document Processing**: Extracts text from PDF, DOCX, TXT files
- **Chunking**: Splits documents into semantic chunks (500 chars with 50 overlap)
- **Embedding**: Uses Sentence Transformers (all-MiniLM-L6-v2) for embeddings
- **Storage**: ChromaDB for vector storage and semantic search
- **Search**: Returns top-k most relevant chunks for any query

### 2. **HR Chatbot Service** (`hr_chatbot_service.py`)
- **RAG Integration**: Retrieves relevant document chunks for context
- **AI Generation**: Uses Gemini AI to generate human-like responses
- **Intent Analysis**: Classifies queries (policy, benefits, leave, etc.)
- **Conversation Context**: Maintains conversation history for better responses
- **Source Citation**: Returns source documents used in response

### 3. **Database Models** (`models.py`)
- **HRDocument**: Stores document metadata (title, category, file path, etc.)
- **ChatConversation**: Groups messages into conversation sessions
- **ChatMessage**: Individual user/assistant messages with feedback

### 4. **API Routes** (`hr_routes.py`)
- **Document Upload**: `POST /api/hr/documents/upload`
- **List Documents**: `GET /api/hr/documents`
- **Delete Document**: `DELETE /api/hr/documents/<id>`
- **Chat Message**: `POST /api/hr/chat/message`
- **Get Conversations**: `GET /api/hr/chat/conversations`
- **Suggested Questions**: `GET /api/hr/chat/suggestions`

## 📦 Installation

### Step 1: Install Dependencies

```bash
cd IntelliHire/backend
pip install -r ../hr_module_requirements.txt
```

**New packages added:**
- `PyPDF2==3.0.1` - PDF text extraction
- `python-docx==1.1.0` - DOCX text extraction
- `chromadb==0.4.22` - Vector database
- `langchain==0.1.6` - RAG framework
- `sentence-transformers==2.3.1` - Embeddings

### Step 2: Database Migration

Run the SQL migration script in phpMyAdmin:

```bash
# Open phpMyAdmin: http://localhost/phpmyadmin
# Select intellihire_db database
# Go to SQL tab
# Copy and paste content from: IntelliHire/database/hr_chatbot_migration.sql
# Click "Go"
```

This creates 3 new tables:
- `hr_documents`
- `chat_conversations`
- `chat_messages`

### Step 3: Environment Variables

Ensure your `.env` file has:

```env
# Gemini AI (already configured for interviews)
GEMINI_API_KEY=your_gemini_api_key_here

# Flask
SECRET_KEY=your_secret_key
UPLOAD_FOLDER=uploads

# Database (already configured)
DATABASE_URL=mysql://root:@localhost/intellihire_db
```

### Step 4: Create Directories

```bash
mkdir -p IntelliHire/backend/uploads/hr_documents
mkdir -p IntelliHire/backend/chroma_db
```

### Step 5: Start Backend

```bash
cd IntelliHire/backend
python app.py
```

Expected output:
```
✅ Google TTS service initialized successfully
✅ HR services (RAG + Chatbot) initialized successfully
✅ ChromaDB collection 'hr_documents' initialized
✅ HR Chatbot Service initialized with Gemini AI
✅ API blueprints registered
```

## 🎯 API Usage Examples

### 1. Upload Document (HR Official)

```bash
POST http://localhost:5000/api/hr/documents/upload
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

# Form Data:
file: company_leave_policy.pdf
title: Employee Leave Policy 2024
description: Complete leave policy including PTO, sick leave, and holidays
category: policy
tags: leave,pto,vacation
```

**Response:**
```json
{
  "message": "Document uploaded and processed successfully",
  "document": {
    "id": 1,
    "title": "Employee Leave Policy 2024",
    "category": "policy",
    "document_id": "employee_leave_policy_2024_a1b2c3d4",
    "uploaded_by": 1,
    "uploader_name": "Admin User",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00"
  },
  "processing_info": {
    "chunks_created": 12,
    "characters_processed": 5420
  }
}
```

### 2. Chat with HR Assistant (Employee)

```bash
POST http://localhost:5000/api/hr/chat/message
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "message": "How many vacation days do I get?",
  "session_id": null
}
```

**Response:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "conversation_id": 1,
  "message": {
    "id": 2,
    "content": "According to our Employee Leave Policy 2024, full-time employees receive 15 vacation days per year, accrued monthly at a rate of 1.25 days per month. Part-time employees receive prorated vacation days based on their work hours. You can find more details in the leave policy document.",
    "sources": [
      {
        "title": "Employee Leave Policy 2024",
        "category": "policy",
        "document_id": "employee_leave_policy_2024_a1b2c3d4",
        "relevance_score": 0.87
      }
    ],
    "has_context": true
  },
  "intent": {
    "categories": ["leave", "benefits"],
    "is_sensitive": false,
    "query_length": 8,
    "is_question": true
  }
}
```

### 3. Get Suggested Questions

```bash
GET http://localhost:5000/api/hr/chat/suggestions?category=benefits
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "suggestions": [
    "What health insurance benefits are available?",
    "Do we have any employee wellness programs?",
    "What retirement benefits does the company offer?",
    "Are there professional development opportunities?"
  ],
  "category": "benefits"
}
```

### 4. List All Documents

```bash
GET http://localhost:5000/api/hr/documents?category=policy
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "documents": [
    {
      "id": 1,
      "title": "Employee Leave Policy 2024",
      "category": "policy",
      "file_type": "pdf",
      "file_size": 245678,
      "uploaded_by": 1,
      "uploader_name": "Admin User",
      "created_at": "2024-01-15T10:30:00"
    },
    {
      "id": 2,
      "title": "Remote Work Policy",
      "category": "policy",
      "file_type": "docx",
      "file_size": 123456,
      "uploaded_by": 1,
      "uploader_name": "Admin User",
      "created_at": "2024-01-14T09:15:00"
    }
  ],
  "total": 2
}
```

## 🔐 Security & Permissions

### Role-Based Access Control

| Role | Document Upload | View Documents | Chat | Delete Documents |
|------|----------------|----------------|------|------------------|
| **Admin** | ✅ | ✅ | ✅ | ✅ |
| **Interviewer (HR)** | ✅ | ✅ | ✅ | ✅ |
| **Candidate** | ❌ | ✅ | ✅ | ❌ |

**Implementation:**
```python
@jwt_required()  # All endpoints require authentication
def upload_hr_document():
    user = User.query.get(get_jwt_identity())
    if user.role not in ['admin', 'interviewer']:
        return jsonify({'error': 'Unauthorized'}), 403
```

## 📊 Document Categories

Supported categories for organization:

| Category | Description | Examples |
|----------|-------------|----------|
| `policy` | Company policies | Leave policy, Remote work policy, Code of conduct |
| `procedure` | Operational procedures | Expense reimbursement, Time tracking, IT support |
| `benefits` | Employee benefits | Health insurance, 401k, Wellness programs |
| `onboarding` | New hire information | First day checklist, Equipment setup, Training schedule |
| `general` | Other HR documents | Company directory, Office locations, FAQs |

## 🤖 How RAG Works

### Traditional Chatbot (Without RAG)
```
User: "How many vacation days do I get?"
AI: "I don't have specific information about your company's vacation policy."
```

### RAG-Powered Chatbot (With Context)
```
1. User asks: "How many vacation days do I get?"
2. RAG Service searches vector DB for relevant chunks
3. Finds: "Full-time employees receive 15 vacation days per year..."
4. AI generates response using found context
5. Response: "According to the Employee Leave Policy, you get 15 vacation days..."
```

### Behind the Scenes:

1. **Document Upload:**
   ```
   PDF → Extract Text → Split into Chunks → Generate Embeddings → Store in ChromaDB
   ```

2. **Query Processing:**
   ```
   User Question → Generate Query Embedding → Search ChromaDB → 
   Get Top 5 Chunks → Send to Gemini AI → Generate Response
   ```

3. **Embedding Example:**
   ```
   Text: "Employees receive 15 vacation days"
   Embedding: [0.123, -0.456, 0.789, ...] (384-dimensional vector)
   ```

4. **Semantic Search:**
   ```
   Query: "How many PTO days?"
   Similar to: "vacation days", "paid time off", "leave allocation"
   → Returns relevant chunks even with different wording
   ```

## 🎨 Frontend Integration (Next Steps)

### Chat Interface Component Structure:
```
<HRChatbot>
  ├── <ChatHeader />
  ├── <MessageList>
  │   ├── <UserMessage />
  │   ├── <AssistantMessage>
  │   │   ├── Message Content
  │   │   └── <SourceDocuments />  ← Shows which docs were used
  │   └── ...
  ├── <SuggestedQuestions />
  ├── <ChatInput />
  └── <FeedbackButtons />
</HRChatbot>
```

### Document Management Interface:
```
<DocumentManagement>
  ├── <UploadDocumentForm />  ← HR Officials only
  ├── <DocumentFilters />     ← Category, date, search
  ├── <DocumentList>
  │   └── <DocumentCard>
  │       ├── Title, Category, Date
  │       └── Delete/View buttons
  └── <DocumentStats />       ← Total docs, by category
</DocumentManagement>
```

## 📈 Analytics & Insights

The system tracks:
- **Message Feedback**: Users can rate responses (1-5 stars)
- **Intent Analysis**: What topics are employees asking about
- **Source Usage**: Which documents are most referenced
- **Conversation Stats**: Average messages per conversation

Query example:
```sql
-- Most asked about categories
SELECT 
    JSON_EXTRACT(intent_analysis, '$.categories') as category,
    COUNT(*) as count
FROM chat_messages
WHERE role = 'user'
GROUP BY category
ORDER BY count DESC;
```

## 🐛 Troubleshooting

### ChromaDB Errors
```
Error: "No such file or directory: chroma_db"
Solution: mkdir -p IntelliHire/backend/chroma_db
```

### Gemini API Errors
```
Error: "GEMINI_API_KEY not found"
Solution: Add to .env file or set environment variable
```

### Document Upload Fails
```
Error: "Unsupported file format"
Solution: Only PDF, DOCX, TXT supported. Check file extension.
```

### No Relevant Documents Found
```
Response: "I don't have enough information..."
Solution: Upload more documents or improve query specificity
```

## 🚀 Production Considerations

1. **Vector Database**:
   - Consider upgrading to Qdrant Cloud or Pinecone for scalability
   - Current ChromaDB is file-based (good for development)

2. **Embeddings**:
   - Current: Local Sentence Transformers (free, runs on CPU)
   - Production: OpenAI Embeddings (better quality, paid)

3. **Rate Limiting**:
   - Add rate limiting to chat endpoint to prevent abuse
   - Gemini API has rate limits (60 requests/minute on free tier)

4. **Caching**:
   - Cache frequent queries to reduce AI API calls
   - Implement Redis for session management

5. **Monitoring**:
   - Track response times, accuracy, user satisfaction
   - Log all queries for compliance and improvement

## 📝 Next Steps

1. ✅ Backend services implemented
2. ✅ Database models created
3. ✅ API routes configured
4. ⏳ Build React frontend components
5. ⏳ Implement document viewer
6. ⏳ Add conversation export feature
7. ⏳ Create admin analytics dashboard

## 🆘 Support

For issues or questions:
1. Check logs: `IntelliHire/backend/logs/`
2. Verify database tables exist: `SHOW TABLES;`
3. Test endpoints with Postman/curl
4. Check ChromaDB directory: `ls -la chroma_db/`

## 📚 References

- **ChromaDB**: https://docs.trychroma.com/
- **LangChain**: https://python.langchain.com/docs/get_started/introduction
- **Sentence Transformers**: https://www.sbert.net/
- **Gemini AI**: https://ai.google.dev/docs

---

**Implementation Date**: December 2024  
**IntelliHire Version**: 1.0.0 + HR Chatbot Module  
**Author**: AI Development Assistant
