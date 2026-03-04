<div align="center">

# IntelliHire

### AI-Powered Candidate Screening & Interview Automation System

![Python](https://img.shields.io/badge/Python-3.8%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=for-the-badge&logo=flask&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Status](https://img.shields.io/badge/Status-In%20Development-yellow?style=for-the-badge)

*A Final Year Project (FYP) — Automating the first round of hiring with AI.*

</div>

---

## What is IntelliHire?

IntelliHire is a full-stack intelligent interview platform that conducts automated first-round candidate screenings. It combines **speech recognition**, **large language models**, **computer vision**, and a **RAG-based question engine** to deliver structured, fair, and fully automated pre-screening interviews — without a human interviewer in the room.

HR teams get a ranked, multi-dimensional evaluation report for every candidate. Candidates get a consistent, bias-reduced interview experience.

---

## Features

### Automated Interviews
- AI-driven conversational interviewer powered by Google Gemini & LangChain
- RAG-based dynamic question generation from job descriptions and CVs
- Real-time speech-to-text (STT) and text-to-speech (TTS) pipeline
- Follow-up and cross-questioning logic

### CV & Candidate Management
- CV upload and automated parsing
- HR chatbot for querying candidate documents
- Role-based access control (Admin, HR, Employee, Candidate)
- Employee dashboard with job application tracking

### Anti-Cheating & Proctoring
- **Gaze Tracking** — detects off-screen eye movement
- **Mobile Detection** — YOLOv8-based unauthorized device detection
- **Tab Monitoring** — tracks browser focus loss and tab switching
- **Behavioral Analysis** — flags suspicious patterns in real time

### Scoring & Reporting
- Verbal confidence scoring via LLM analysis
- Answer content evaluation against expected responses
- Facial expression analysis (micro-expression assessment)
- Aggregated multi-modal candidate reports with ranking

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, MUI, Recharts, Socket.IO client, WebRTC |
| **Backend** | Flask 3, SQLAlchemy, Flask-JWT-Extended, Flask-CORS, Gunicorn |
| **AI / ML** | Google Gemini API, LangChain, ChromaDB, Sentence Transformers, YOLOv8, OpenCV, gTTS, SpeechRecognition |
| **Database** | MySQL (primary), ChromaDB (vector store for RAG) |
| **DevOps** | Render (deployment), python-dotenv, CORS |

---

## Project Structure

```
IntelliHire/
├── backend/
│   ├── app.py                  # Flask application factory
│   ├── config/                 # Environment-based config
│   ├── models/                 # SQLAlchemy DB models
│   ├── routes/                 # API & HR route blueprints
│   ├── services/               # Business logic
│   │   ├── gemini_service.py       # LLM integration
│   │   ├── hr_rag_service.py       # RAG / document Q&A
│   │   ├── cv_monitoring_service.py
│   │   ├── voice_analysis_service.py
│   │   └── hr_chatbot_service.py
│   ├── utils/                  # CV parser & helpers
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/              # Route-level page components
│   │   ├── components/         # Reusable UI components
│   │   ├── services/           # API service layer
│   │   ├── contexts/           # React context providers
│   │   └── hooks/              # Custom React hooks
│   └── package.json
├── ai_models/
│   └── modules/                # Standalone AI module scripts
├── database/                   # SQL schemas & migration files
└── project_documents/          # Budget, proposals, docs
```

---

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- MySQL (via XAMPP or any MySQL server)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/your-username/IntelliHire.git
cd IntelliHire
```

### 2. Backend setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux / macOS

# Install Python dependencies
pip install -r requirements.txt

# Configure environment variables
copy .env.example .env
# Open .env and fill in your values (see below)
```

### 3. Database setup

```bash
# Start your MySQL server
# Create a database named 'intellihire'
# Then initialise schema:
python init_db.py
```

### 4. Frontend setup

```bash
cd ../frontend
npm install
```

### 5. Environment variables

Create `backend/.env` with the following:

```env
SECRET_KEY=your_secret_key
DATABASE_URL=mysql+pymysql://user:password@localhost/intellihire
JWT_SECRET_KEY=your_jwt_secret
GOOGLE_API_KEY=your_gemini_api_key
GITHUB_COPILOT_TOKEN=your_token   # optional
```

---

## Running the App

```bash
# Terminal 1 — Backend
cd backend
python app.py

# Terminal 2 — Frontend
cd frontend
npm start
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000/api |
| Health Check | http://localhost:5000/api/health |

---

## API Overview

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login & receive JWT |
| POST | `/api/auth/logout` | Invalidate session |

### Interviews
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/interview/create` | Create interview session |
| POST | `/api/interview/start/<id>` | Start a session |
| GET | `/api/interview/sessions/<id>` | Get session details |

### AI Processing
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ai/speech-to-text` | Convert audio to text |
| POST | `/api/ai/text-to-speech` | Convert text to audio |
| POST | `/api/ai/generate-question` | RAG question generation |
| POST | `/api/ai/analyze-confidence` | Verbal confidence scoring |

---

## Roles & Access Control

| Role | Access |
|---|---|
| **Admin** | Full system access, user management |
| **HR Manager** | Job postings, candidate management, reports |
| **Employee** | View assigned interviews & status |
| **Candidate** | Take interviews, view own results |

---

## Roadmap

- [x] Flask backend with JWT auth and RBAC
- [x] React + TypeScript frontend with MUI
- [x] MySQL schema with migrations
- [x] CV upload, parsing, and management
- [x] Google Gemini LLM integration
- [x] RAG system with ChromaDB & LangChain
- [x] HR chatbot for document Q&A
- [x] Voice analysis service
- [x] YOLOv8 CV monitoring (mobile detection)
- [x] Proctoring — tab switching & gaze detection
- [x] Role-based dashboards (HR, Employee, Admin)
- [ ] Full real-time STT/TTS interview flow
- [ ] OpenFace micro-expression integration
- [ ] Advanced multi-modal scoring algorithm
- [ ] Candidate comparative ranking reports
- [ ] Production deployment (Render)

---

## License

Academic Final Year Project — All rights reserved to the development team and supervising institution.

---

<div align="center">
  <sub>Built with purpose by the IntelliHire Team · Final Year Project · 2025–2026</sub>
</div>
