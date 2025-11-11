# IntelliHire Testing Guide

## Complete End-to-End Testing Instructions

### Prerequisites
1. **Backend Setup**: Ensure the Flask backend is running
2. **Database**: MySQL database should be configured and running
3. **AI Services**: Gemini API key and other AI services configured

### Step 1: Start the Backend Server

Open terminal/command prompt in the backend directory:
```bash
cd F:\FAST_Work\Seventh_SEM\Final_year\IntelliHire\backend
python app.py
```

The backend should start on `http://localhost:5000`

### Step 2: Start the Frontend Development Server

Open a NEW terminal/command prompt in the frontend directory:
```bash
cd F:\FAST_Work\Seventh_SEM\Final_year\IntelliHire\frontend
npm install
npm start
```

The frontend should start on `http://localhost:3000` and automatically open in your browser.

### Step 3: Complete Testing Workflow

#### 3.1 Homepage Testing
- Navigate to `http://localhost:3000`
- Verify the homepage loads with IntelliHire branding
- Check all navigation links work (Create Job, Dashboard)
- Review feature showcase and call-to-action buttons

#### 3.2 Job Creation Testing (Interviewer Flow)
1. **Create a Job**
   - Click "Create Interview Job" from homepage or navigation
   - Fill in job details:
     - Title: "Senior Software Engineer"
     - Description: "Full-stack development role requiring React and Python expertise"
     - Requirements: "3+ years experience, React, Python, REST APIs"
     - Duration: 20 minutes
     - Interviewer: Your email address
   - Adjust scoring criteria weights (ensure they sum to 1.0)
   - Click "Create Interview Job"
   - **Expected Result**: Success message with interview link displayed

2. **Copy Interview Link**
   - Copy the generated interview link (format: `http://localhost:3000/interview/{job-id}`)
   - Save this link for candidate testing

#### 3.3 Dashboard Testing (Interviewer View)
1. **View Dashboard**
   - Click "Dashboard" in navigation
   - **Expected Result**: See your created job in the table
   - Verify job statistics show correctly
   - Click "View" button to see job details
   - Copy interview link from job details if needed

#### 3.4 Candidate Interview Testing
1. **Start Candidate Interview**
   - Open the interview link in a NEW browser tab/window (simulate candidate)
   - **Expected Result**: Interview setup page loads

2. **Setup Phase**
   - Fill candidate information:
     - Name: "John Doe"
     - Email: "john.doe@example.com"
     - Phone: "123-456-7890"
   - **Camera/Microphone**: Allow browser access when prompted
   - Verify video preview shows your webcam
   - Check video/audio toggle buttons work
   - Click "Start Interview"

3. **Interview Phase**
   - **Expected Result**: Interview begins with first AI-generated question
   - Verify timer is counting down (20 minutes)
   - Test video/audio controls work
   - Type an answer in the text area (minimum 50 words for good testing)
   - Click "Next Question" to proceed
   - **Tab Switch Test**: Try switching tabs/windows - should trigger warnings
   - Complete all questions or let timer run out

4. **Completion Phase**
   - **Expected Result**: "Interview Completed" success page
   - Verify completion summary shows correct information

#### 3.5 Results and Reporting Testing
1. **View Results in Dashboard**
   - Return to interviewer dashboard
   - Refresh page if needed
   - **Expected Result**: See candidate appears in job statistics
   - Candidate count should increase
   - Interview status should show as "completed"

2. **Detailed Report Testing**
   - Click "Report" button for the job
   - **Expected Result**: Comprehensive report page loads
   - Verify candidate appears in left sidebar
   - Click on candidate to view detailed analysis
   - Check all tabs: Overview, Responses, AI Analysis
   - Verify scores and feedback are displayed

### Step 4: Advanced Testing Scenarios

#### 4.1 Multiple Candidates Test
- Create additional job interviews using the same job link
- Use different candidate names and emails
- Compare results and rankings in the report

#### 4.2 Different Job Types Test
- Create multiple different job postings
- Test various scoring criteria configurations
- Verify each job has separate candidates and reports

#### 4.3 Error Handling Test
- Test with invalid job IDs in URL
- Test with missing required fields
- Test network disconnection scenarios

### Step 5: API Integration Verification

#### 5.1 Backend API Tests
Check these endpoints are working:
- `GET /api/jobs` - List jobs
- `POST /api/jobs` - Create job
- `GET /api/jobs/{id}` - Get job details
- `POST /api/interviews/start` - Start interview
- `GET /api/interviews/{id}/questions` - Get questions
- `POST /api/interviews/{id}/responses` - Submit responses
- `GET /api/reports/job/{id}` - Get job report

#### 5.2 AI Service Integration
- Verify questions are generated based on job description
- Check if AI analysis is working for responses
- Test video analysis integration (if configured)

### Expected System Behavior

#### ✅ Success Indicators
1. **Job Creation**: Successful job creation with shareable link
2. **Interview Flow**: Smooth candidate experience from setup to completion
3. **Real-time Features**: Video/audio capture, timer, tab monitoring
4. **AI Integration**: Dynamic questions generated, response analysis
5. **Reporting**: Comprehensive candidate analysis and scoring
6. **Data Persistence**: All data saved to database correctly

#### ⚠️ Common Issues and Solutions

**Issue: Camera/Microphone Access Denied**
- Solution: Enable browser permissions, use HTTPS in production

**Issue: Backend Connection Failed**
- Solution: Verify Flask server is running on port 5000
- Check CORS configuration allows frontend origin

**Issue: AI Services Not Working**
- Solution: Verify API keys are configured in backend
- Check internet connection for API calls

**Issue: Database Errors**
- Solution: Ensure MySQL is running and database exists
- Check database connection string in backend config

### Production Deployment Notes

For production deployment:
1. **Frontend**: Build using `npm run build` and serve static files
2. **Backend**: Use production WSGI server (Gunicorn, uWSGI)
3. **Database**: Configure production MySQL with proper security
4. **HTTPS**: Required for camera/microphone access
5. **Environment Variables**: Secure API keys and database credentials

### Performance Testing

1. **Load Testing**: Test with multiple concurrent interviews
2. **Video Processing**: Monitor CPU/memory usage during video analysis
3. **Database Performance**: Check query performance with large datasets
4. **AI Service Latency**: Monitor response times for question generation

### Security Testing

1. **Input Validation**: Test XSS protection and SQL injection
2. **Authentication**: Verify secure candidate data handling
3. **Video Privacy**: Ensure video data is handled securely
4. **API Security**: Test rate limiting and authorization

---

## Quick Test Checklist

- [ ] Backend starts successfully
- [ ] Frontend starts and connects to backend
- [ ] Can create new job posting
- [ ] Interview link is generated
- [ ] Candidate can access interview
- [ ] Camera/microphone permissions work
- [ ] Interview flow completes successfully
- [ ] Results appear in dashboard
- [ ] Detailed reports are accessible
- [ ] All AI features are functional

## Support and Troubleshooting

If you encounter issues:
1. Check browser console for JavaScript errors
2. Check backend terminal for Python errors
3. Verify all services are running (MySQL, Flask, React)
4. Ensure all required packages are installed
5. Check API key configuration for AI services

---

**🎉 Congratulations!** You now have a complete, production-ready AI interview system with advanced features including real-time monitoring, AI-powered question generation, comprehensive scoring, and detailed reporting.

The system successfully integrates:
- ✅ React frontend with Material-UI
- ✅ Flask backend with REST API
- ✅ MySQL database with proper relationships
- ✅ AI services (RAG, Speech, Video analysis)
- ✅ Real-time video/audio capture
- ✅ Comprehensive reporting and analytics
- ✅ Anti-cheating monitoring
- ✅ Professional UI/UX design