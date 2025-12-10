# Dynamic Follow-up Question Generation

## Overview
IntelliHire now supports **intelligent, context-aware follow-up questions** generated dynamically during interviews based on candidate responses using **GitHub Models API (GPT-5-mini)**.

## ❌ What's NOT Used
- **RAG Question Generator (`rag_question_generator.py`)**: Not used for interview questions
  - This module uses LangChain + ChromaDB
  - It's a standalone demo, not integrated into the main interview flow
  
## ✅ What IS Used
**GitHub Models API (GPT-5-mini)** for:
1. **Initial Question Generation** - 5 questions at interview start (CV-aware)
2. **Response Analysis** - Scoring responses (relevance, technical, communication, confidence)
3. **Follow-up Generation** - Dynamic questions based on response quality ⭐ NEW
4. **Final Assessment** - Comprehensive interview evaluation

## How It Works

### 1. Question Generation Flow
```
Interview Start
    ↓
GitHub GPT-5-mini generates 5 initial questions
    ↓
Questions stored in database
    ↓
Candidate answers Q1
    ↓
GPT-5-mini analyzes response & scores it
    ↓
IF score < 85 → Generate follow-up question
    ↓
Follow-up added to question queue dynamically
    ↓
Candidate proceeds to next question (Q2 or follow-up)
```

### 2. Follow-up Triggers
Follow-up questions are generated when:
- **Average score < 85/100** (relevance + technical + communication + confidence) / 4
- Answer is vague or lacks specifics
- Technical depth is insufficient
- Response shows low confidence
- Answer is incomplete or off-topic

### 3. Follow-up Generation Logic
```python
# In github_copilot_service.py
async def generate_followup_question(
    original_question,
    candidate_answer,
    analysis_scores,
    job_context,
    cv_text
):
    """
    Generates intelligent follow-up based on:
    - Original question context
    - Candidate's answer quality
    - Weakness areas (from scores)
    - Job requirements
    - Candidate's background (CV)
    """
```

**Types of follow-ups generated:**
- **Vague answer (low relevance)**: "Can you provide a specific example of when you..."
- **Shallow answer (low technical)**: "How would you implement that technically?"
- **Uncertain answer (low confidence)**: "Have you worked with this in a real project?"
- **Incomplete answer**: "Can you elaborate on [missing aspect]?"
- **Surface-level**: "What edge cases would you consider?"

### 4. Database Schema
```sql
-- questions table
CREATE TABLE questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    interview_id INT NOT NULL,
    question TEXT NOT NULL,
    question_type VARCHAR(50),
    parent_question_id INT NULL,           -- NEW: Links to parent question
    is_followup BOOLEAN DEFAULT FALSE,     -- NEW: Identifies follow-ups
    order_index INT,
    ai_context JSON,
    created_at DATETIME,
    FOREIGN KEY (interview_id) REFERENCES interviews(id),
    FOREIGN KEY (parent_question_id) REFERENCES questions(id) ON DELETE SET NULL
);
```

## Setup Instructions

### 1. Run Database Migration
```bash
cd backend
python add_followup_columns.py
```

This adds:
- `parent_question_id` column (links follow-up to original question)
- `is_followup` column (flags follow-up questions)

### 2. Verify GitHub Token
Ensure `GITHUB_TOKEN` is set in your environment:
```bash
# In .env or environment
GITHUB_TOKEN=your_github_token_here
```

### 3. Test the Feature
1. Start backend: `python app.py`
2. Start frontend: `npm start`
3. Create an interview with a candidate
4. During interview:
   - Give a brief/vague answer to Q1
   - System will generate follow-up automatically
   - Continue with next question

## Example Flow

### Scenario: Vague Answer
**Q1 (Initial)**: "Tell me about your experience with Python web frameworks."

**Candidate Answer**: "I've worked with Flask a bit."

**AI Analysis**:
```json
{
  "relevance_score": 60,
  "technical_score": 45,
  "communication_score": 55,
  "confidence_score": 50,
  "feedback": "Answer is too brief. Lacks specific examples and technical details."
}
```

**Average Score**: 52.5/100 → **Trigger follow-up**

**Q1b (Follow-up)**: "Can you describe a specific Flask project you built and what features you implemented?"

---

### Scenario: Good Answer
**Q2 (Initial)**: "How do you handle error handling in your applications?"

**Candidate Answer**: "I use try-catch blocks with custom exception classes. For my recent Node.js API, I created a centralized error handler middleware that catches all errors, logs them to CloudWatch, and returns consistent JSON error responses with appropriate HTTP status codes. I also implement input validation using Joi to prevent errors early."

**AI Analysis**:
```json
{
  "relevance_score": 95,
  "technical_score": 92,
  "communication_score": 90,
  "confidence_score": 88
}
```

**Average Score**: 91.25/100 → **No follow-up needed** ✅

## API Response Format

### Submit Response Endpoint
```javascript
POST /api/interviews/:id/response

Response:
{
  "success": true,
  "response": {
    "id": 123,
    "interview_id": 45,
    "question_id": 78,
    "answer_text": "My answer...",
    "relevance_score": 60,
    "technical_score": 55,
    ...
  },
  "ai_feedback": "Answer needs more specific examples...",
  "followup_question": {              // NEW: Only present if follow-up generated
    "id": 79,
    "interview_id": 45,
    "question": "Can you elaborate on...",
    "question_type": "followup",
    "parent_question_id": 78,
    "is_followup": true,
    "order_index": 6
  }
}
```

## Frontend Integration

### Dynamic Question Handling
```javascript
// In CandidateInterview.js
const response = await api.interviews.submitResponse(interview.id, {
  question_id: currentQuestion.id,
  answer_text: currentAnswer
});

// Check if follow-up was generated
const followupQuestion = response.data.followup_question;
if (followupQuestion) {
  console.log('🔄 Follow-up question generated:', followupQuestion.question);
  // Add follow-up to questions array dynamically
  setQuestions(prevQuestions => [...prevQuestions, followupQuestion]);
}
```

## Benefits

1. **Adaptive Interviews**: Questions adjust based on candidate performance
2. **Deeper Assessment**: Probe weak areas automatically
3. **Natural Flow**: Conversational, like a real human interviewer
4. **Fair Evaluation**: Give candidates chances to clarify/elaborate
5. **No Manual Intervention**: Fully automated follow-up generation

## Configuration

### Adjust Follow-up Threshold
```python
# In github_copilot_service.py
# Current: avg_score > 85 → no follow-up
# More strict: avg_score > 75
# More lenient: avg_score > 90

if avg_score > 85:  # Change this threshold
    return None
```

### Disable Follow-ups
```python
# In api_routes.py, comment out follow-up generation:

# followup_question_data = None
# if github_copilot_service and github_copilot_service.enabled:
#     ... (comment entire block)
```

## Troubleshooting

### Follow-ups Not Generating
1. Check GitHub token is valid: `echo $GITHUB_TOKEN`
2. Verify database migration ran: `SELECT * FROM questions LIMIT 1;` (should have `parent_question_id`, `is_followup`)
3. Check backend logs for errors
4. Ensure score is < 85 (high-quality answers don't trigger follow-ups)

### Too Many Follow-ups
- Increase threshold from 85 to 90 in `generate_followup_question()`
- Add max follow-ups per interview limit

### Follow-ups Not Showing in UI
- Check browser console for errors
- Verify `followup_question` in API response
- Ensure `setQuestions()` is updating state

## Testing

### Test Follow-up Generation
```python
# In Python console
from services.github_copilot_service import GitHubCopilotService
import asyncio

service = GitHubCopilotService()

scores = {
    'relevance_score': 55,
    'technical_score': 60,
    'communication_score': 50,
    'confidence_score': 45,
    'feedback': 'Answer lacks depth'
}

loop = asyncio.new_event_loop()
followup = loop.run_until_complete(
    service.generate_followup_question(
        original_question="Tell me about your Python experience",
        candidate_answer="I used Python a bit",
        analysis_scores=scores,
        job_context="Senior Python Developer"
    )
)

print("Follow-up:", followup)
# Expected: "Can you describe a specific Python project you've worked on and what technologies you used?"
```

## Architecture Summary

```
┌─────────────────────────────────────────────────────────┐
│                   INTERVIEW SYSTEM                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────┐         ┌──────────────────┐       │
│  │  Initial Qs    │         │  Response Submit │       │
│  │  Generation    │────────▶│  + AI Analysis   │       │
│  │  (GPT-5-mini)  │         │  (GPT-5-mini)    │       │
│  └────────────────┘         └──────────────────┘       │
│         │                            │                  │
│         │                            ▼                  │
│         │                   ┌──────────────────┐       │
│         │                   │  Score < 85?     │       │
│         │                   └──────────────────┘       │
│         │                            │                  │
│         │                            │ YES              │
│         │                            ▼                  │
│         │                   ┌──────────────────┐       │
│         │                   │  Generate        │       │
│         │                   │  Follow-up Q     │       │
│         │                   │  (GPT-5-mini)    │       │
│         │                   └──────────────────┘       │
│         │                            │                  │
│         ▼                            ▼                  │
│  ┌──────────────────────────────────────────┐          │
│  │     Questions Array (Dynamic)            │          │
│  │  [Q1, Q2, Q3, Q1-followup, Q4, Q5]       │          │
│  └──────────────────────────────────────────┘          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Credits
- **Model**: GitHub Models API - GPT-5-mini
- **Feature**: Dynamic Follow-up Question Generation
- **Status**: ✅ Implemented and Ready
