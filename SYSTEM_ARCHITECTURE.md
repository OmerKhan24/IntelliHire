# System Architecture

## 3.1 Overview

IntelliHire is an AI-powered candidate screening platform that automates preliminary interviews through multi-modal analysis. The system employs a three-tier architecture comprising a React-based frontend, Flask-powered backend, and MySQL database, integrated with advanced AI/ML models for comprehensive candidate evaluation.

## 3.2 Architectural Pattern

The system follows a **Model-View-Controller (MVC)** pattern with a **Service-Oriented Architecture (SOA)** approach, enabling modular development and seamless integration of AI services.

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│              (React + TypeScript + WebRTC)                       │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/REST API & WebSocket
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Application Layer                           │
│                    (Flask + Python 3.8+)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   API Routes │  │ Auth Service │  │  Interview   │          │
│  │   Controllers│  │   (JWT)      │  │   Manager    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   AI/ML      │  │   Database   │  │   External   │
│   Services   │  │    Layer     │  │   Services   │
│              │  │   (MySQL)    │  │  (Gemini AI) │
└──────────────┘  └──────────────┘  └──────────────┘
```

## 3.3 System Components

### 3.3.1 Frontend Layer (Presentation Tier)

**Technology Stack**: React 18, TypeScript, WebRTC, Material-UI

**Key Modules**:
- **Interview Interface**: Real-time audio/video capture and streaming
- **Dashboard**: Candidate and HR role-based views
- **Anti-Cheating Monitor**: Browser focus, tab switching, and device detection
- **Report Viewer**: Visual analytics and score presentation

**Responsibilities**:
- User interface rendering and state management
- Real-time media capture (audio/video streams)
- WebSocket communication for live interview sessions
- Client-side validation and error handling

### 3.3.2 Backend Layer (Application Tier)

**Technology Stack**: Flask 3.0, Python 3.8+, Flask-CORS, JWT Authentication

**Core Services**:

1. **Authentication Service**
   - User registration and login with role-based access (Candidate/HR/Admin)
   - JWT token generation and validation
   - Session management

2. **Interview Management Service**
   - Interview scheduling and status tracking
   - Real-time conversation orchestration
   - Answer recording and storage

3. **AI Processing Service**
   - Speech-to-Text conversion (Whisper API)
   - Text-to-Speech synthesis
   - RAG-based question generation
   - Answer analysis and scoring

4. **Computer Vision Service**
   - Gaze tracking (MediaPipe)
   - Mobile phone detection (YOLOv8)
   - Facial expression analysis
   - Suspicious behavior detection

5. **HR Chatbot Service**
   - Document management and embedding
   - RAG-powered query resolution
   - Company policy Q&A

### 3.3.3 Data Layer (Persistence Tier)

**Primary Database**: MySQL 8.0

**Schema Design**:
- **Users**: Authentication and profile information
- **Interviews**: Interview sessions and metadata
- **Questions**: Question bank and difficulty levels
- **Answers**: Candidate responses with timestamps
- **Scores**: Multi-dimensional evaluation metrics
- **HR Documents**: Company policies and embeddings
- **Chat History**: User-chatbot interactions

**Vector Database**: ChromaDB for document embeddings and semantic search

### 3.3.4 AI/ML Pipeline

**Integrated Models**:

| Model | Purpose | Technology |
|-------|---------|------------|
| Whisper | Speech-to-Text | OpenAI API |
| Text-to-Speech | Voice synthesis | Google TTS |
| Gemini AI | Question generation & answer evaluation | Google Generative AI |
| YOLOv8 | Mobile phone detection | Ultralytics |
| MediaPipe | Face mesh & gaze tracking | Google MediaPipe |
| ChromaDB | Document embedding & RAG | Vector Database |

**Processing Flow**:
```
Audio Input → Whisper STT → Text Processing → Gemini Analysis 
     ↓                                              ↓
Video Input → CV Models → Behavior Analysis → Score Generation
     ↓                                              ↓
Features → Confidence Score → Expression Score → Final Report
```

## 3.4 Data Flow Architecture

### 3.4.1 Interview Workflow

```
1. Candidate Login → 2. Start Interview → 3. Capture Media Streams
                                                  ↓
                                    4. Process Audio (Whisper STT)
                                                  ↓
                                    5. Analyze Video (CV Models)
                                                  ↓
                          6. Generate Question (RAG + Gemini)
                                                  ↓
                          7. Synthesize Speech (TTS) → Play Audio
                                                  ↓
                              8. Record Answer → Evaluate
                                                  ↓
                                    9. Repeat Steps 3-8
                                                  ↓
                          10. Generate Report → Store Results
```

### 3.4.2 Anti-Cheating Monitoring

Real-time parallel processing:
- **Frontend**: Tab visibility API, browser focus events
- **Backend CV**: Mobile detection every 2 seconds, gaze tracking every 1 second
- **Scoring**: Weighted deduction based on violation severity

## 3.5 Security Architecture

**Authentication**: JWT-based stateless authentication with role-based access control (RBAC)

**Authorization Layers**:
- Public: Registration, Login
- Candidate: Interview access, personal reports
- HR: All interviews, comparative analytics, document management
- Admin: User management, system configuration

**Data Protection**:
- Password hashing (Werkzeug Security)
- HTTPS enforcement for production
- CORS configuration for cross-origin requests
- SQL injection prevention (SQLAlchemy ORM)

## 3.6 Scalability & Performance

**Optimization Strategies**:
- **Asynchronous Processing**: Background tasks for video analysis
- **Caching**: Redis integration for session management (future enhancement)
- **Database Indexing**: Optimized queries on user_id, interview_id
- **API Rate Limiting**: Prevent abuse and ensure fair usage
- **Load Balancing**: Horizontal scaling capability (future deployment)

**Performance Metrics**:
- Average response time: < 2 seconds for API calls
- Real-time processing: 15-30 FPS for video analysis
- Concurrent users: Supports 50+ simultaneous interviews

## 3.7 Deployment Architecture

**Development Environment**:
```
Local Machine → XAMPP (MySQL) → Flask Dev Server → React Dev Server
```

**Production Environment (Proposed)**:
```
Client (Browser) → CDN (Static Assets) → Load Balancer
                                              ↓
                          Application Servers (Docker Containers)
                                              ↓
                              Database Cluster (MySQL)
                                              ↓
                           Cloud Storage (Media Files)
```

## 3.8 Technology Justification

- **Flask**: Lightweight, flexible, excellent Python ecosystem integration
- **React**: Component-based architecture, strong TypeScript support
- **MySQL**: ACID compliance, robust relational data handling
- **WebRTC**: Real-time media communication without plugins
- **ChromaDB**: Efficient vector similarity search for RAG
- **Gemini AI**: Advanced language understanding, cost-effective API

---

*This architecture ensures modularity, maintainability, and scalability while providing real-time AI-powered candidate evaluation capabilities.*
