# HR Assistant Role Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         INTELLIHIRE SYSTEM                          │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                           USER ROLES                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────┐ │
│  │    ADMIN    │  │  HR OFFICIAL│  │  EMPLOYEE   │  │ CANDIDATE│ │
│  │             │  │ (interviewer)│  │             │  │          │ │
│  │  Full Access│  │  HR Dashboard│  │  Chat Only  │  │ Interview│ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └────┬─────┘ │
│         │                │                 │               │       │
└─────────┼────────────────┼─────────────────┼───────────────┼───────┘
          │                │                 │               │
          └────────┬───────┴─────────────────┘               │
                   │                                         │
┌──────────────────▼─────────────────────────┐              │
│         HR ASSISTANT MODULE                │              │
├────────────────────────────────────────────┤              │
│                                            │              │
│  ┌──────────────────────────────────────┐ │              │
│  │         CHAT INTERFACE               │ │              │
│  │  (Accessible to HR & Employees)      │ │              │
│  │  ┌────────────────────────────────┐  │ │              │
│  │  │  • Ask questions              │  │ │              │
│  │  │  • Get AI responses           │  │ │              │
│  │  │  • View conversation history  │  │ │              │
│  │  └────────────────────────────────┘  │ │              │
│  └──────────────────────────────────────┘ │              │
│                                            │              │
│  ┌──────────────────────────────────────┐ │              │
│  │    DOCUMENT MANAGEMENT (HR Only)     │ │              │
│  │  ┌────────────────────────────────┐  │ │              │
│  │  │  • Upload policy documents    │  │ │              │
│  │  │  • Manage document library    │  │ │              │
│  │  │  • View statistics            │  │ │              │
│  │  │  • Delete outdated docs       │  │ │              │
│  │  └────────────────────────────────┘  │ │              │
│  └──────────────────────────────────────┘ │              │
│                                            │              │
│  ┌──────────────────────────────────────┐ │              │
│  │    EMPLOYEE MANAGEMENT (HR Only)     │ │              │
│  │  ┌────────────────────────────────┐  │ │              │
│  │  │  • Register new employees     │  │ │              │
│  │  │  • View employee list         │  │ │              │
│  │  │  • Activate/Deactivate users  │  │ │              │
│  │  │  • Update employee info       │  │ │              │
│  │  └────────────────────────────────┘  │ │              │
│  └──────────────────────────────────────┘ │              │
│                                            │              │
└────────────────┬───────────────────────────┘              │
                 │                                          │
                 │                                          │
┌────────────────▼───────────────────────────┐  ┌──────────▼──────────┐
│         BACKEND SERVICES                   │  │  INTERVIEW MODULE   │
├────────────────────────────────────────────┤  │  (Separate System)  │
│                                            │  ├─────────────────────┤
│  ┌──────────────────────────────────────┐ │  │  • Video interviews │
│  │     HR RAG SERVICE                   │ │  │  • Question system  │
│  │  • ChromaDB vector database          │ │  │  • AI evaluation    │
│  │  • Document processing               │ │  │  • Reports          │
│  │  • Semantic search                   │ │  └─────────────────────┘
│  │  • Sentence transformers             │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │     HR CHATBOT SERVICE               │ │
│  │  • GitHub Models API (GPT-4o-mini)   │ │
│  │  • Context-aware responses           │ │
│  │  • RAG integration                   │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │     AUTHENTICATION & AUTHORIZATION   │ │
│  │  • JWT token validation              │ │
│  │  • Role-based access control         │ │
│  │  • Password hashing                  │ │
│  └──────────────────────────────────────┘ │
│                                            │
└────────────────┬───────────────────────────┘
                 │
                 │
┌────────────────▼───────────────────────────┐
│            DATABASE LAYER                  │
├────────────────────────────────────────────┤
│                                            │
│  ┌─────────────┐  ┌──────────────────┐    │
│  │   Users     │  │   HR Documents   │    │
│  │ • id        │  │ • id             │    │
│  │ • username  │  │ • title          │    │
│  │ • email     │  │ • file_path      │    │
│  │ • role ───────►│ • category       │    │
│  │ • is_active │  │ • uploaded_by    │    │
│  └─────────────┘  └──────────────────┘    │
│                                            │
│  ┌─────────────────────┐  ┌─────────────┐ │
│  │ Chat Conversations  │  │ Chat Messages│ │
│  │ • id               │  │ • id         │ │
│  │ • user_id         │◄──│ • conv_id    │ │
│  │ • session_id      │  │ • message    │ │
│  │ • created_at      │  │ • role       │ │
│  └─────────────────────┘  └─────────────┘ │
│                                            │
└────────────────────────────────────────────┘
```

## Role Access Flow

### HR Official Flow
```
┌───────────┐
│  HR Login │
└─────┬─────┘
      │
      ▼
┌──────────────────┐
│  HR Dashboard    │
│  • Create Jobs   │
│  • Manage Staff  │
└─────┬────────────┘
      │
      ▼
┌──────────────────────────────────────┐
│       HR Assistant Access            │
├──────────────────────────────────────┤
│  Tab 1: Chat                         │
│  ✓ Ask questions                     │
│  ✓ Get AI answers                    │
│  ✓ View history                      │
├──────────────────────────────────────┤
│  Tab 2: Documents                    │
│  ✓ Upload PDF/DOCX/TXT              │
│  ✓ Categorize documents             │
│  ✓ Manage document library          │
├──────────────────────────────────────┤
│  Tab 3: Employees                    │
│  ✓ Register new employees           │
│  ✓ View employee list               │
│  ✓ Activate/Deactivate accounts     │
└──────────────────────────────────────┘
```

### Employee Flow
```
┌──────────────────┐
│ Employee Created │
│   by HR          │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Employee Login   │
│ (credentials)    │
└────────┬─────────┘
         │
         ▼
┌────────────────────────────────┐
│    Employee Portal Access      │
├────────────────────────────────┤
│  ✓ Chat Interface Only         │
│  ✓ Ask HR questions            │
│  ✓ Get policy information      │
│  ✓ View conversation history   │
│                                │
│  ✗ Cannot upload documents     │
│  ✗ Cannot manage employees     │
│  ✗ Cannot access HR dashboard  │
└────────────────────────────────┘
```

## API Authorization Matrix

```
┌─────────────────────────────────────────────────────────────────┐
│                    ENDPOINT ACCESS CONTROL                      │
├──────────────────────────┬──────┬────────┬──────────┬──────────┤
│ Endpoint                 │ Admin│   HR   │ Employee │Candidate │
├──────────────────────────┼──────┼────────┼──────────┼──────────┤
│ POST /hr/documents/upload│  ✓   │   ✓    │    ✗     │    ✗     │
│ GET  /hr/documents       │  ✓   │   ✓    │    ✗     │    ✗     │
│ DEL  /hr/documents/:id   │  ✓   │   ✓    │    ✗     │    ✗     │
├──────────────────────────┼──────┼────────┼──────────┼──────────┤
│ POST /hr/employees/reg   │  ✓   │   ✓    │    ✗     │    ✗     │
│ GET  /hr/employees       │  ✓   │   ✓    │    ✗     │    ✗     │
│ PUT  /hr/employees/:id   │  ✓   │   ✓    │    ✗     │    ✗     │
├──────────────────────────┼──────┼────────┼──────────┼──────────┤
│ POST /hr/chat/message    │  ✓   │   ✓    │    ✓     │    ✗     │
│ GET  /hr/chat/conv       │  ✓   │   ✓    │    ✓     │    ✗     │
│ GET  /hr/chat/suggest    │  ✓   │   ✓    │    ✓     │    ✗     │
├──────────────────────────┼──────┼────────┼──────────┼──────────┤
│ POST /jobs/              │  ✓   │   ✓    │    ✗     │    ✗     │
│ GET  /jobs/              │  ✓   │   ✓    │    ✗     │    ✓     │
├──────────────────────────┼──────┼────────┼──────────┼──────────┤
│ POST /interviews/start   │  ✗   │   ✗    │    ✗     │    ✓     │
│ POST /interviews/resp    │  ✗   │   ✗    │    ✗     │    ✓     │
└──────────────────────────┴──────┴────────┴──────────┴──────────┘

Legend:
  ✓ = Allowed
  ✗ = Denied (403 Forbidden)
```

## Data Flow - HR Document Upload & Employee Query

```
1. HR UPLOADS DOCUMENT
   ┌──────────────┐
   │  HR uploads  │
   │  policy.pdf  │
   └──────┬───────┘
          │
          ▼
   ┌──────────────────────┐
   │  Flask Backend       │
   │  /hr/documents/upload│
   │  • Saves file        │
   │  • Extracts text     │
   └──────┬───────────────┘
          │
          ▼
   ┌──────────────────────────┐
   │  HR RAG Service          │
   │  • Splits into chunks    │
   │  • Creates embeddings    │
   │  • Stores in ChromaDB    │
   └──────┬───────────────────┘
          │
          ▼
   ┌──────────────────────┐
   │  ChromaDB            │
   │  Vector Database     │
   │  (policy embeddings) │
   └──────────────────────┘

2. EMPLOYEE ASKS QUESTION
   ┌─────────────────────┐
   │  Employee asks:     │
   │  "What is leave     │
   │   policy?"          │
   └──────┬──────────────┘
          │
          ▼
   ┌──────────────────────┐
   │  Flask Backend       │
   │  /hr/chat/message    │
   │  • Validates token   │
   │  • Checks role       │
   └──────┬───────────────┘
          │
          ▼
   ┌──────────────────────────┐
   │  HR Chatbot Service      │
   │  • Queries ChromaDB      │
   │  • Gets relevant docs    │
   └──────┬───────────────────┘
          │
          ▼
   ┌──────────────────────────┐
   │  ChromaDB Search         │
   │  • Semantic search       │
   │  • Returns top 5 chunks  │
   └──────┬───────────────────┘
          │
          ▼
   ┌──────────────────────────┐
   │  GitHub Models API       │
   │  GPT-4o-mini             │
   │  • Context: doc chunks   │
   │  • Question: user query  │
   │  • Generates answer      │
   └──────┬───────────────────┘
          │
          ▼
   ┌──────────────────────┐
   │  Employee receives   │
   │  detailed answer with│
   │  policy information  │
   └──────────────────────┘
```

## Technology Stack

```
┌─────────────────────────────────────────┐
│             FRONTEND                    │
│  • React 18                             │
│  • Material-UI (MUI)                    │
│  • React Router                         │
│  • Axios (API client)                   │
│  • TypeScript (partial)                 │
└─────────────────┬───────────────────────┘
                  │ HTTP/REST API
                  │ JSON payloads
                  │ JWT tokens
┌─────────────────▼───────────────────────┐
│             BACKEND                     │
│  • Flask (Python web framework)         │
│  • Flask-JWT-Extended (authentication)  │
│  • Flask-SQLAlchemy (ORM)               │
│  • Werkzeug (password hashing)          │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼────────┐  ┌───────▼──────────────────┐
│   PostgreSQL   │  │  AI/ML Services          │
│   Database     │  │  • ChromaDB (vectors)    │
│   • Users      │  │  • Sentence Transformers │
│   • Documents  │  │  • GitHub Models API     │
│   • Chats      │  │    (GPT-4o-mini)         │
└────────────────┘  └──────────────────────────┘
```

## Security Layers

```
┌──────────────────────────────────────────────┐
│         USER AUTHENTICATION                  │
│  ┌────────────────────────────────────────┐  │
│  │  1. User logs in with credentials      │  │
│  │  2. Backend validates and hashes pw    │  │
│  │  3. JWT token generated and returned   │  │
│  └────────────────────────────────────────┘  │
└─────────────────┬────────────────────────────┘
                  │
┌─────────────────▼────────────────────────────┐
│         ROLE-BASED AUTHORIZATION             │
│  ┌────────────────────────────────────────┐  │
│  │  1. JWT token sent with each request   │  │
│  │  2. Backend decodes and extracts role  │  │
│  │  3. Endpoint checks allowed roles      │  │
│  │  4. 403 if unauthorized, 200 if OK     │  │
│  └────────────────────────────────────────┘  │
└─────────────────┬────────────────────────────┘
                  │
┌─────────────────▼────────────────────────────┐
│         FRONTEND ROUTE PROTECTION            │
│  ┌────────────────────────────────────────┐  │
│  │  1. ProtectedRoute component wraps UI  │  │
│  │  2. Checks user role from localStorage │  │
│  │  3. Redirects if unauthorized          │  │
│  │  4. Conditional UI rendering by role   │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```
