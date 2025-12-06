# HR Chatbot Module - Quick Setup Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Dependencies (2 min)

```bash
cd IntelliHire/backend
pip install PyPDF2==3.0.1 python-docx==1.1.0 chromadb==0.4.22 langchain==0.1.6 langchain-community==0.0.20 sentence-transformers==2.3.1
```

### Step 2: Run Database Migration (1 min)

1. Open phpMyAdmin: http://localhost/phpmyadmin
2. Select `intellihire_db` database
3. Go to **SQL** tab
4. Copy & paste content from: `IntelliHire/database/hr_chatbot_migration.sql`
5. Click **Go**

### Step 3: Create Directories (30 sec)

```bash
mkdir IntelliHire\backend\uploads\hr_documents
mkdir IntelliHire\backend\chroma_db
```

### Step 4: Verify .env File (30 sec)

Ensure your `.env` has:
```env
GEMINI_API_KEY=your_api_key_here
SECRET_KEY=your_secret_key
UPLOAD_FOLDER=uploads
DATABASE_URL=mysql://root:@localhost/intellihire_db
```

### Step 5: Start Backend (1 min)

```bash
cd IntelliHire\backend
python app.py
```

**Expected Output:**
```
✅ Google TTS service initialized successfully
✅ HR services (RAG + Chatbot) initialized successfully
✅ ChromaDB collection 'hr_documents' initialized
✅ API blueprints registered
```

## ✅ Verify Installation

### Test Document Upload

```bash
# Create a test document first
echo "Company Leave Policy: Employees receive 15 vacation days per year." > test_policy.txt

# Upload it (replace YOUR_JWT_TOKEN with actual token from login)
curl -X POST http://localhost:5000/api/hr/documents/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@test_policy.txt" \
  -F "title=Test Leave Policy" \
  -F "category=policy"
```

### Test Chatbot

```bash
curl -X POST http://localhost:5000/api/hr/chat/message \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "How many vacation days do employees get?"}'
```

## 🎯 What You Get

### For HR Officials (Admin/Interviewer Role):
- Upload company documents (PDF, DOCX, TXT)
- Manage document library
- View chat analytics

### For Employees/Candidates:
- Chat with AI assistant about company policies
- Get instant answers from uploaded documents
- View source documents used in answers

## 📊 API Endpoints Available

| Endpoint | Method | Purpose | Role |
|----------|--------|---------|------|
| `/api/hr/documents/upload` | POST | Upload document | HR/Admin |
| `/api/hr/documents` | GET | List documents | All |
| `/api/hr/documents/<id>` | GET | Get document | All |
| `/api/hr/documents/<id>` | DELETE | Delete document | HR/Admin |
| `/api/hr/chat/message` | POST | Send chat message | All |
| `/api/hr/chat/conversations` | GET | Get chat history | All |
| `/api/hr/chat/suggestions` | GET | Get suggested questions | All |
| `/api/hr/documents/stats` | GET | Get statistics | All |

## 🔧 Common Issues

### Issue: "Module not found: chromadb"
**Solution:** `pip install chromadb==0.4.22`

### Issue: "GEMINI_API_KEY not found"
**Solution:** Add to `.env` file: `GEMINI_API_KEY=your_key_here`

### Issue: "Table 'hr_documents' doesn't exist"
**Solution:** Run the SQL migration script in phpMyAdmin

### Issue: "Permission denied" on upload
**Solution:** Create directory: `mkdir IntelliHire\backend\uploads\hr_documents`

## 📖 Full Documentation

See `HR_CHATBOT_IMPLEMENTATION.md` for:
- Detailed architecture
- Complete API documentation
- RAG technology explanation
- Frontend integration guide
- Production deployment tips

## 🎨 Next: Build Frontend

The backend is ready! Next steps:
1. Create React chat interface component
2. Add document upload form for HR officials
3. Display source documents in chat responses
4. Add conversation history sidebar

Example React component structure:
```jsx
<HRAssistant>
  <ChatWindow />
  <DocumentManager />  // For HR role only
  <ConversationHistory />
</HRAssistant>
```

## 💡 Tips

1. **Test with real documents**: Upload your actual company policies for best results
2. **Start simple**: Begin with FAQ documents, then add complex policies
3. **Monitor feedback**: Use the feedback rating feature to improve responses
4. **Organize by category**: Use categories (policy, benefits, etc.) for better search

## 🆘 Need Help?

1. Check logs in console
2. Verify all services initialized (see Expected Output above)
3. Test individual endpoints with curl/Postman
4. Check ChromaDB directory exists: `ls chroma_db/`

---

**Status**: Backend Complete ✅  
**Next**: Frontend Implementation ⏳
