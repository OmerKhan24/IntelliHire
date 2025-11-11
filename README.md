# IntelliHire - AI-Powered Candidate Screening System

## 🎯 Project Overview

IntelliHire is an intelligent interview automation system that conducts preliminary candidate screenings using AI. The system combines speech recognition, natural language processing, computer vision, and machine learning to provide comprehensive candidate evaluation.

## 🏗️ Architecture

```
Frontend (React + TypeScript)
↓ (WebRTC + REST API)
Backend (Flask + Python)
↓ (SQL)
Database (MySQL)
↓ (AI/ML Pipeline)
AI Models (Whisper, YOLOv8, MediaPipe, OpenFace, LLMs)
```

## 🚀 Features

### Core Functionality
- **Automated Interviews**: Real-time conversation with AI interviewer
- **Speech Processing**: Speech-to-text and text-to-speech conversion
- **Question Generation**: RAG-based dynamic question creation
- **Multi-modal Analysis**: Verbal, facial, and behavioral assessment

### Anti-Cheating Measures
- **Gaze Tracking**: Monitor eye movement patterns
- **Mobile Detection**: Detect unauthorized device usage
- **Tab Monitoring**: Track browser focus and tab switching
- **Behavioral Analysis**: Suspicious activity detection

### Scoring & Reporting
- **Confidence Analysis**: Assess candidate's verbal confidence
- **Content Evaluation**: Match answers against expected responses
- **Expression Analysis**: Facial micro-expression evaluation
- **Comprehensive Reports**: Individual and comparative candidate reports

## 📁 Project Structure

```
IntelliHire/
├── backend/                 # Flask API server
│   ├── app.py              # Main Flask application
│   ├── routes/             # API route handlers
│   ├── models/             # Database models
│   ├── ai_models/          # AI/ML processing modules
│   └── requirements.txt    # Python dependencies
├── frontend/               # React TypeScript app
│   ├── src/               # React source code
│   ├── public/            # Static assets
│   └── package.json       # Node.js dependencies
├── database/              # Database schemas and migrations
├── uploads/               # File upload storage
└── docs/                  # Documentation
```

## 🛠️ Installation & Setup

### Prerequisites
- **Python 3.8+**
- **Node.js 16+**
- **XAMPP (MySQL)**
- **Git**

### 1. Clone Repository
```bash
git clone <repository-url>
cd IntelliHire
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
copy .env.example .env
# Edit .env with your configuration
```

### 3. Database Setup
```bash
# Start XAMPP MySQL server
# Create database 'intellihire' in phpMyAdmin
# Run Flask to create tables
python app.py
```

### 4. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm start
```

### 5. API Keys Configuration
Edit `.env` file with your API keys:
```
OPENAI_API_KEY=your_openai_api_key
GOOGLE_CLOUD_KEY_PATH=path_to_google_credentials.json
```

## 🚦 Running the Application

### Development Mode
```bash
# Terminal 1: Backend
cd backend
python app.py

# Terminal 2: Frontend
cd frontend
npm start
```

### Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **API Health Check**: http://localhost:5000/api/health

## 🧪 Development Phases

### Phase 1: Foundation ✅
- [x] Project structure setup
- [x] Flask backend with basic routes
- [x] React frontend with TypeScript
- [x] Database models and schema
- [x] Basic API communication

### Phase 2: Speech Pipeline 🔄
- [ ] Whisper integration for STT
- [ ] Google TTS integration
- [ ] Real-time audio streaming
- [ ] Basic conversation flow

### Phase 3: RAG System
- [ ] Document processing (CV, job description)
- [ ] ChromaDB vector database
- [ ] LangChain question generation
- [ ] Cross-questioning logic

### Phase 4: Computer Vision
- [ ] YOLOv8 mobile detection
- [ ] MediaPipe gaze tracking
- [ ] OpenFace expression analysis
- [ ] Browser monitoring

### Phase 5: Integration & Scoring
- [ ] Multi-modal data fusion
- [ ] Scoring algorithms
- [ ] Report generation
- [ ] Candidate ranking

## 🔧 Technologies Used

### Backend
- **Flask**: Web framework
- **SQLAlchemy**: ORM for database operations
- **OpenAI Whisper**: Speech-to-text
- **LangChain**: RAG implementation
- **YOLOv8**: Object detection
- **MediaPipe**: Computer vision
- **OpenFace**: Facial analysis

### Frontend
- **React**: User interface library
- **TypeScript**: Type-safe JavaScript
- **WebRTC**: Real-time communication
- **Axios**: HTTP client

### Database
- **MySQL**: Primary database
- **ChromaDB**: Vector database for RAG

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Interview Management
- `POST /api/interview/create` - Create interview
- `POST /api/interview/start/<id>` - Start interview session
- `GET /api/interview/sessions/<id>` - Get session details

### AI Processing
- `POST /api/ai/speech-to-text` - Convert speech to text
- `POST /api/ai/analyze-confidence` - Analyze text confidence
- `POST /api/ai/generate-question` - Generate next question
- `POST /api/ai/text-to-speech` - Convert text to speech

## 🔒 Security Considerations

- Input validation and sanitization
- Secure file upload handling
- API rate limiting
- CORS configuration
- Environment variable protection

## 📈 Performance Optimization

- Model caching and pre-loading
- Efficient video frame processing
- Database query optimization
- Real-time data streaming

## 🧭 Next Steps

1. **Complete Speech Pipeline** - Implement real-time STT/TTS
2. **Build RAG System** - Question generation and answer evaluation
3. **Add Computer Vision** - Monitoring and detection features
4. **Create Scoring System** - Multi-modal analysis and reporting
5. **Polish UI/UX** - Professional interview interface
6. **Testing & Deployment** - Comprehensive testing and production setup

## 🤝 Contributing

This is an academic Final Year Project (FYP). Development approach:
1. Incremental feature implementation
2. Thorough testing of each component
3. Regular supervisor consultations
4. Documentation of challenges and solutions

## 📞 Support

For technical issues or questions:
- Check documentation in `/docs`
- Review API endpoints and examples
- Test individual components separately
- Consult with project supervisor

## 📄 License

Academic project - All rights reserved to the development team and supervising institution.

---

**Project Status**: 🟡 In Development
**Last Updated**: October 2025
**Team**: IntelliHire Development Team