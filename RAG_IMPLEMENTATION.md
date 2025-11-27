# RAG-Powered CV Analysis - Implementation Summary

## What is RAG?
**RAG (Retrieval Augmented Generation)** combines:
- **Retrieval**: Extracting relevant information from candidate's CV
- **Augmented**: Enriching AI prompts with this CV context
- **Generation**: Creating personalized interview questions based on candidate's actual experience

## How It Works

### 1. CV Upload Flow
```
Candidate uploads CV → Backend saves file → Extract text from PDF/DOC → Store path in database
```

### 2. Question Generation with RAG
```
Get CV text → Parse candidate's skills/experience → Send to Gemini AI with job requirements → Generate personalized questions
```

**Without RAG (Generic)**:
- "Tell me about your experience with React"
- "Describe a project you worked on"

**With RAG (Personalized)**:
- "I see you worked on an e-commerce platform using React and Redux. Can you explain the architecture challenges you faced with state management?"
- "Your CV mentions migrating a legacy system - what was your approach to handling data consistency during the migration?"

## Changes Made

### Backend Changes

#### 1. Database Model (`models/models.py`)
```python
# Added to Interview model
cv_file_path = db.Column(db.String(500))  # Store uploaded CV file path
```

**SQL Migration**:
```sql
ALTER TABLE interviews ADD COLUMN cv_file_path VARCHAR(500) AFTER candidate_phone;
```
Run this in phpMyAdmin: http://localhost/phpmyadmin

#### 2. CV Upload Endpoint (`routes/api_routes.py`)
- **Route**: `POST /api/candidate/upload_cv`
- **Accepts**: multipart/form-data with `file` and `interview_id`
- **Validates**: PDF, DOC, DOCX only
- **Stores**: `backend/uploads/cvs/{interview_id}_{timestamp}_{filename}`

#### 3. CV Text Extraction (`utils/cv_parser.py`)
- **extract_text_from_cv()**: Main function to extract text
- **_extract_from_pdf()**: Uses PyPDF2 for PDF parsing
- **_extract_from_docx()**: Uses python-docx for Word documents
- **Returns**: Plain text content from CV

#### 4. Enhanced Gemini Service (`services/gemini_service.py`)
```python
async def generate_questions(self, job_description, requirements, num_questions=5, cv_text=None):
```

**RAG Prompt Template**:
```
You are an expert interviewer.

Job: {job_description}
Requirements: {requirements}

Candidate's CV:
{cv_text from uploaded file}

Generate personalized questions that:
1. Reference specific experiences from their CV
2. Assess skills they claim to have
3. Explore gaps or transitions
4. Test depth of knowledge
5. Evaluate role fit
```

#### 5. Updated Question Generation (`routes/api_routes.py`)
```python
# Extract CV text if available
if interview.cv_file_path:
    cv_text = extract_text_from_cv(interview.cv_file_path)

# Pass CV text to AI for RAG-powered questions
ai_questions = gemini_service.generate_questions(
    job.description,
    job.requirements,
    num_questions=5,
    cv_text=cv_text  # RAG context
)
```

### Frontend Changes

#### 1. CV Upload UI (`pages/CandidateInterview.js`)
- **Added**: File upload button with PDF/DOC/DOCX validation
- **State**: `cvFile: null` in candidateInfo
- **Validation**: Required before interview starts
- **Visual Feedback**: Shows ✓ when CV uploaded

#### 2. Interview Start Flow
```javascript
// 1. Start interview
const interview = await api.interviews.start({...candidateInfo});

// 2. Upload CV with interview_id
const formData = new FormData();
formData.append('file', candidateInfo.cvFile);
formData.append('interview_id', interview.id);
await api.candidate.uploadCV(formData);

// 3. Get RAG-powered questions
const questions = await api.interviews.getQuestions(interview.id);
```

## Packages Installed
```bash
pip install PyPDF2 python-docx
```

- **PyPDF2**: Extract text from PDF files
- **python-docx**: Extract text from Word documents

## Testing RAG

### Test Case 1: CV with React Experience
**CV Contains**: "3 years React, Redux, TypeScript at Tech Corp"

**Expected Questions**:
1. "You have 3 years with React and Redux at Tech Corp. Can you describe the most complex state management challenge you faced?"
2. "I see you used TypeScript in your React projects. How did you handle type definitions for third-party libraries?"

### Test Case 2: CV with Career Gap
**CV Contains**: Gap between 2021-2022

**Expected Questions**:
1. "I notice a gap in your employment from 2021 to 2022. What were you doing during this time?"
2. "How have you kept your skills current during your career break?"

### Test Case 3: CV with Leadership Experience
**CV Contains**: "Led team of 5 developers"

**Expected Questions**:
1. "You mentioned leading a team of 5 developers. How did you handle conflicts within the team?"
2. "What was your approach to mentoring junior developers on your team?"

## Benefits of RAG Implementation

1. **Personalized Questions**: Each candidate gets unique questions based on their CV
2. **Deeper Assessment**: Questions probe specific experiences they claim
3. **Consistency Detection**: AI can identify inconsistencies between CV and answers
4. **Efficiency**: No need for HR to manually review CV before interview
5. **Fair Evaluation**: Questions tailored to candidate's level and background

## File Structure
```
backend/
├── models/models.py                    # Added cv_file_path column
├── routes/api_routes.py                # CV upload endpoint + RAG integration
├── services/gemini_service.py          # Enhanced with cv_text parameter
├── utils/cv_parser.py                  # NEW: CV text extraction
├── migrations/add_cv_file_path.sql     # NEW: Database migration
└── uploads/cvs/                        # NEW: CV storage directory

frontend/
└── pages/CandidateInterview.js         # CV upload UI + validation
```

## Next Steps to Test

1. **Run Database Migration**:
   - Open phpMyAdmin: http://localhost/phpmyadmin
   - Select `intellihire_db`
   - Go to SQL tab
   - Run: `ALTER TABLE interviews ADD COLUMN cv_file_path VARCHAR(500);`

2. **Restart Backend**:
   ```bash
   cd F:\FAST_Work\Seventh_SEM\Final_year
   .\.venv\Scripts\Activate.ps1
   cd IntelliHire\backend
   python app.py
   ```

3. **Test Complete Flow**:
   - Create job as interviewer
   - Open interview link on mobile (192.168.100.80:3000)
   - Upload a sample CV (PDF or Word)
   - Start interview
   - Check backend logs for: "✅ Extracted X chars from CV for RAG"
   - Verify questions are personalized to CV content

4. **Sample CVs for Testing**:
   - Create test PDFs with:
     - Different tech stacks (React, Python, Java)
     - Various experience levels (Junior, Senior)
     - Career gaps or transitions
     - Leadership roles vs IC roles

## Troubleshooting

**CV upload fails**:
- Check `backend/uploads/cvs/` directory exists
- Verify file extension is .pdf, .doc, or .docx
- Check file size < 5MB

**Generic questions still generated**:
- Check backend logs for "✅ Extracted X chars from CV"
- Verify cv_file_path saved in database
- Ensure PyPDF2/python-docx installed

**Questions not personalized**:
- Check CV has substantial content (not just a template)
- Verify Gemini API key is active
- Review extracted CV text in logs

## Impact on Interview Quality

**Before RAG** (Generic):
- All candidates get same questions
- Doesn't leverage CV information
- Less engaging for candidates
- Harder to assess specific claims

**After RAG** (Personalized):
- Each candidate gets tailored questions
- Directly references their experience
- More engaging interview experience
- Can verify CV claims through questioning
- Better assessment of actual skills vs resume fluff
