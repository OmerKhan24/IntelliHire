import os
import asyncio
import aiohttp
from concurrent.futures import ThreadPoolExecutor


class GitHubCopilotService:
    """
    GitHub Copilot API service for AI-powered question generation, 
    answer analysis, and interview assessment using GPT-4o-mini.
    """
    
    def __init__(self):
        self.executor = ThreadPoolExecutor(max_workers=3)
        # GitHub Models API configuration - Try both endpoints
        self.endpoints = [
            "https://models.inference.ai.azure.com/chat/completions",
            "https://models.github.ai/inference/chat/completions"
        ]
        self.endpoint = self.endpoints[0]  # Start with Azure endpoint
        
        # GPT-5 Models available on GitHub Models (Released Aug 2025):
        # - gpt-5: Full reasoning model for complex tasks
        # - gpt-5-mini: Balanced reasoning and speed (RECOMMENDED)
        # - gpt-5-nano: Ultra-fast for simple tasks
        # - gpt-5-chat: Natural conversations
        self.model = "gpt-5-mini"
        
        token = os.environ.get('GITHUB_TOKEN')
        print(f"🔑 GITHUB_TOKEN found: {bool(token)}")
        
        if token:
            print(f"🔑 Token (first 15 chars): {token[:15]}...")
            self.token = token
            self.enabled = True
            print(f"✅ GitHub Copilot service enabled with model: {self.model}")
        else:
            self.token = None
            self.enabled = False
            print("❌ GITHUB_TOKEN not found - running in fallback mode")
    
    async def _call_api(self, messages, retry_count=0):
        """Make async HTTP request to GitHub Models API with retry logic and exponential backoff"""
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28"
        }
        
        payload = {
            "model": self.model,
            "messages": messages,
            # GPT-5 models only support temperature=1 (default), so we omit it
            "max_completion_tokens": 2000
        }
        
        # Increase timeout to 120 seconds
        timeout = aiohttp.ClientTimeout(total=120)
        
        try:
            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.post(self.endpoint, json=payload, headers=headers) as response:
                    if response.status == 429:
                        # Rate limited - implement exponential backoff
                        if retry_count < 3:
                            wait_time = (2 ** retry_count) * 2  # 2, 4, 8 seconds
                            print(f"⏳ Rate limited, waiting {wait_time}s before retry {retry_count + 1}/3...")
                            await asyncio.sleep(wait_time)
                            return await self._call_api(messages, retry_count + 1)
                        else:
                            error_text = await response.text()
                            raise Exception(f"API rate limit exceeded after {retry_count} retries: {error_text}")
                    
                    if response.status != 200:
                        error_text = await response.text()
                        
                        # Try alternate endpoint if first one fails (not for rate limit)
                        if retry_count == 0 and len(self.endpoints) > 1:
                            print(f"⚠️ First endpoint failed, trying alternate endpoint...")
                            self.endpoint = self.endpoints[1]
                            return await self._call_api(messages, retry_count=1)
                        
                        raise Exception(f"API error {response.status}: {error_text}")
                    
                    # Get raw response text first
                    text = await response.text()
                    
                    # Handle empty responses
                    if not text or text.strip() == '':
                        raise Exception("API returned empty response")
                    
                    # Try to parse as JSON regardless of content-type
                    try:
                        import json
                        result = json.loads(text)
                        
                        # Validate response structure
                        if 'choices' not in result or len(result['choices']) == 0:
                            raise Exception(f"Invalid API response structure: {text[:200]}")
                        
                        content = result['choices'][0]['message']['content']
                        
                        if not content or content.strip() == '':
                            raise Exception("API returned empty content")
                        
                        return content
                        
                    except json.JSONDecodeError as e:
                        print(f"❌ JSON parse error: {e}")
                        print(f"📄 Raw response (first 500 chars): {text[:500]}")
                        raise Exception(f"Failed to parse API response as JSON: {str(e)}")
                        
        except asyncio.TimeoutError:
            if retry_count == 0:
                print(f"⏱️ Request timed out, retrying...")
                return await self._call_api(messages, retry_count=1)
            else:
                raise Exception("API request timed out after retry")
    
    async def generate_questions(self, job_description, requirements, num_questions=5, cv_text=None, duration_minutes=20, scoring_criteria=None):
        """
        Generate interview questions using GitHub Copilot API
        
        Args:
            job_description: Job description text
            requirements: Job requirements
            num_questions: Number of questions to generate
            cv_text: Candidate's CV text for personalized questions
            duration_minutes: Interview duration to calculate question complexity
            scoring_criteria: Scoring weights for different aspects (dict or string)
        """
        if not self.enabled:
            print("⚠️ GitHub Copilot disabled, using fallback questions")
            return self._generate_fallback_questions(job_description, requirements, num_questions)
        
        # Parse scoring criteria - handle both dict and string formats
        if isinstance(scoring_criteria, str):
            try:
                import json
                weights = json.loads(scoring_criteria)
            except:
                weights = {}
        else:
            weights = scoring_criteria or {}
        
        technical_weight = weights.get('technical', 30)
        behavioral_weight = weights.get('behavioral', 30)
        situational_weight = weights.get('situational', 40)
        
        # Calculate time per question
        time_per_question = duration_minutes // num_questions
        
        try:
            if cv_text:
                # RAG-powered: Generate personalized questions based on CV
                user_prompt = f"""You are conducting an INITIAL SCREENING INTERVIEW (first round) for a {duration_minutes}-minute conversation.

📋 JOB DETAILS:
Position: {job_description[:500]}
Requirements: {requirements[:500]}

👤 CANDIDATE'S CV:
{cv_text[:1500]}

🎯 INTERVIEW FOCUS:
- Basic qualifications verification: {technical_weight}%
- Communication & soft skills: {behavioral_weight}%  
- Motivation & cultural fit: {situational_weight}%

⏱️ TIME ALLOCATION:
- Total Duration: {duration_minutes} minutes
- {num_questions} questions (~{time_per_question} minutes each)

Generate EXACTLY {num_questions} INITIAL SCREENING questions that:

1. ARE CONVERSATIONAL: Focus on getting to know the candidate, not deep technical testing
2. VERIFY BASICS: Confirm they understand fundamental concepts from their CV (not advanced algorithms)
3. ASSESS COMMUNICATION: Questions should reveal how clearly they can explain their work
4. CHECK MOTIVATION: Why they're interested in this role and company
5. CULTURAL FIT: Their work style, collaboration approach, and career goals
6. BE APPROACHABLE: Questions should feel friendly, not intimidating

AVOID:
- Complex coding problems or algorithms
- Deep technical architecture questions
- Whiteboard-style problem solving
- Trick questions or brain teasers

IMPORTANT: Return ONLY the numbered questions (1-{num_questions}), one per line. NO additional text.

Example format:
1. I noticed you mentioned [technology/project] in your CV. Can you tell me about that experience and what you enjoyed most about working with it?
2. [Next question]..."""
            else:
                # Generic questions without CV
                user_prompt = f"""You are conducting an INITIAL SCREENING INTERVIEW (first round) for a {duration_minutes}-minute conversation.

📋 JOB DETAILS:
Position: {job_description[:500]}
Requirements: {requirements[:500]}

🎯 INTERVIEW FOCUS:
- Basic qualifications: {technical_weight}%
- Communication & personality: {behavioral_weight}%
- Motivation & fit: {situational_weight}%

⏱️ TIME ALLOCATION:
- Total Duration: {duration_minutes} minutes
- {num_questions} questions (~{time_per_question} minutes each)

Generate EXACTLY {num_questions} INITIAL SCREENING questions that:

1. ARE FRIENDLY & CONVERSATIONAL: Create a comfortable interview atmosphere
2. CHECK BASIC UNDERSTANDING: Verify they understand the role and have foundational knowledge
3. ASSESS COMMUNICATION: How clearly can they explain their background and experience?
4. EXPLORE MOTIVATION: Why they want this role and what they're looking for in their career
5. EVALUATE FIT: Their work preferences, learning style, and team collaboration
6. BE OPEN-ENDED: Allow candidates to showcase their personality and communication skills

AVOID:
- Complex technical problems or coding challenges
- Deep system design questions
- Advanced algorithms or data structures
- Pressure-testing or trick questions

IMPORTANT: Return ONLY the numbered questions (1-{num_questions}), one per line. NO additional text.

Example format:
1. Tell me about yourself and what drew you to apply for this position?
2. [Next question]..."""
            
            print(f"🤖 Calling GitHub Copilot API for question generation...")
            print(f"📝 Prompt length: {len(user_prompt)} chars")
            
            messages = [
                {"role": "system", "content": "You are a friendly HR interviewer conducting initial screening interviews. Generate conversational, approachable questions suitable for first-round interviews that assess basic qualifications, communication skills, and cultural fit."},
                {"role": "user", "content": user_prompt}
            ]
            
            text = await self._call_api(messages)
            
            print(f"✅ GitHub Copilot API response received")
            print(f"📄 Response length: {len(text)} chars")
            print(f"📄 Response preview: {text[:200]}...")
            
            questions = []
            for line in text.split('\n'):
                line = line.strip()
                if line and (line[0].isdigit() or line.startswith('-')):
                    question_text = line.split('.', 1)[-1].strip() if '.' in line else line.lstrip('- ')
                    if question_text:
                        questions.append(question_text)
            
            print(f"✅ Parsed {len(questions)} questions from AI response")
            return questions[:num_questions] if questions else self._generate_fallback_questions(job_description, requirements, num_questions)
            
        except Exception as e:
            print(f"❌ Error generating questions: {e}")
            import traceback
            traceback.print_exc()
            return self._generate_fallback_questions(job_description, requirements, num_questions)
    
    def _generate_fallback_questions(self, job_description, requirements, num_questions):
        """Fallback questions when AI service is unavailable"""
        return [
            f"Tell me about your experience related to: {job_description[:100]}",
            f"How do you meet the requirement: {requirements[:100]}",
            "Describe a challenging project you've worked on and how you overcame obstacles.",
            "What are your greatest strengths and how do they apply to this role?",
            "Where do you see yourself in 3-5 years?"
        ][:num_questions]
    
    async def analyze_response(self, question, answer, job_context=None, cv_text=None):
        """
        Analyze candidate's response using GitHub Copilot API
        
        Args:
            question: Interview question asked
            answer: Candidate's answer
            job_context: Job-related context
            cv_text: Candidate's CV for context-aware analysis
        
        Returns:
            dict: Analysis with relevance, technical, communication, confidence scores and feedback
        """
        if not self.enabled:
            print("⚠️ GitHub Copilot disabled, using fallback analysis")
            return self._generate_fallback_analysis(question, answer)
        
        try:
            cv_context = f"\nCandidate's Background (from CV):\n{cv_text[:800]}" if cv_text else ""
            
            user_prompt = f"""You are an expert technical interviewer. Analyze this interview response thoroughly.

❓ QUESTION: {question}

💬 CANDIDATE'S ANSWER:
{answer}

🎯 JOB CONTEXT: {job_context or 'General position'}{cv_context}

📊 PROVIDE DETAILED SCORING (0-100 for each):

1. RELEVANCE SCORE (0-100):
   - Does the answer directly address the question?
   - Is it on-topic and focused?
   - Does it provide what was asked for?

2. TECHNICAL COMPETENCY SCORE (0-100):
   - Depth of technical knowledge demonstrated
   - Accuracy of technical details
   - Understanding of concepts and best practices
   - Real-world application experience

3. COMMUNICATION QUALITY SCORE (0-100):
   - Clarity and structure of explanation
   - Use of appropriate terminology
   - Logical flow of ideas
   - Completeness of response

4. CONFIDENCE SCORE (0-100):
   - Answer demonstrates conviction and certainty
   - No hesitation or uncertainty
   - Specific examples and concrete details
   - Shows ownership of experience

5. DETAILED FEEDBACK (3-5 sentences):
   - Specific strengths in the answer
   - Areas for improvement
   - Overall assessment

FORMAT YOUR RESPONSE EXACTLY AS:
Relevance: [score]
Technical: [score]
Communication: [score]
Confidence: [score]
Feedback: [Your detailed feedback here]"""
            
            print(f"🤖 Calling GitHub Copilot API for answer analysis...")
            
            messages = [
                {"role": "system", "content": "You are an expert technical interviewer. Analyze candidate responses and provide detailed scoring and feedback."},
                {"role": "user", "content": user_prompt}
            ]
            
            text = await self._call_api(messages)
            
            print(f"✅ GitHub Copilot analysis received: {len(text)} chars")
            
            # Parse scores from AI response
            analysis = {
                'relevance_score': 70, 
                'technical_score': 70, 
                'communication_score': 70, 
                'confidence_score': 70,
                'feedback': text
            }
            
            for line in text.split('\n'):
                if 'relevance:' in line.lower():
                    try:
                        score = int(''.join(filter(str.isdigit, line)))
                        analysis['relevance_score'] = min(max(score, 0), 100)
                    except:
                        pass
                elif 'technical:' in line.lower():
                    try:
                        score = int(''.join(filter(str.isdigit, line)))
                        analysis['technical_score'] = min(max(score, 0), 100)
                    except:
                        pass
                elif 'communication:' in line.lower():
                    try:
                        score = int(''.join(filter(str.isdigit, line)))
                        analysis['communication_score'] = min(max(score, 0), 100)
                    except:
                        pass
                elif 'confidence:' in line.lower():
                    try:
                        score = int(''.join(filter(str.isdigit, line)))
                        analysis['confidence_score'] = min(max(score, 0), 100)
                    except:
                        pass
                elif 'feedback:' in line.lower():
                    analysis['feedback'] = line.split(':', 1)[1].strip()
            
            print(f"✅ Parsed scores - R:{analysis['relevance_score']} T:{analysis['technical_score']} C:{analysis['communication_score']} Conf:{analysis['confidence_score']}")
            return analysis
            
        except Exception as e:
            print(f"❌ Error analyzing response: {e}")
            import traceback
            traceback.print_exc()
            return self._generate_fallback_analysis(question, answer)
    
    def _generate_fallback_analysis(self, question, answer):
        """Fallback analysis when AI service is unavailable"""
        word_count = len(answer.split())
        relevance = min(100, max(30, word_count * 2))
        return {
            'relevance_score': relevance,
            'technical_score': 65,
            'communication_score': 70,
            'confidence_score': 70,
            'feedback': f"Response contains {word_count} words. Consider providing more detailed examples and specific technical information."
        }
    
    async def generate_final_analysis(self, interview_data, responses_data, job_data):
        """
        Generate comprehensive final interview analysis using GitHub Copilot API
        
        Args:
            interview_data: Interview metadata and aggregate scores
            responses_data: List of candidate responses with scores
            job_data: Job details and requirements
        
        Returns:
            dict: Final analysis with assessment, strengths, weaknesses, recommendation, next steps
        """
        if not self.enabled:
            print("⚠️ GitHub Copilot disabled, using fallback final analysis")
            return self._generate_fallback_final_analysis(interview_data, responses_data)
        
        try:
            # Prepare response summary - SHORTENED to prevent timeouts
            responses_summary = "\n".join([
                f"Q{i+1}: {r['question'][:80]}...\nA: {r['answer'][:150]}...\nScores - R:{r['relevance']} T:{r['technical']} C:{r['communication']} Conf:{r['confidence']}"
                for i, r in enumerate(responses_data[:5])  # First 5 responses
            ])
            
            user_prompt = f"""You are an expert HR interviewer. Provide a CONCISE final assessment.

📋 JOB: {job_data.get('title', 'Unknown')}

👤 CANDIDATE: {interview_data.get('candidate_name', 'Unknown')}

📊 INTERVIEW SUMMARY (5 Questions):
{responses_summary}

📈 AVERAGE SCORES:
Relevance: {interview_data.get('avg_relevance', 0)}/100
Technical: {interview_data.get('avg_technical', 0)}/100
Communication: {interview_data.get('avg_communication', 0)}/100
Confidence: {interview_data.get('avg_confidence', 0)}/100
Overall: {interview_data.get('avg_score', 0)}/100

Provide a BRIEF assessment in this EXACT format:

Overall: [2-3 sentence assessment]
Strengths:
- [strength 1]
- [strength 2]
- [strength 3]
Improvements:
- [area 1]
- [area 2]
Recommendation: [Choose: "Strongly Recommend", "Recommend", "Consider", or "Not Recommended"]
Next Steps: [Brief next steps]

Keep responses SHORT and focused."""
            
            print(f"🤖 Calling GitHub Copilot API for final analysis...")
            
            messages = [
                {"role": "system", "content": "You are an expert HR interviewer. Provide comprehensive final assessment of candidates based on their interview performance."},
                {"role": "user", "content": user_prompt}
            ]
            
            text = await self._call_api(messages)
            
            print(f"✅ GitHub Copilot final analysis received: {len(text)} chars")
            
            # Parse the AI response
            analysis = {
                'overall_assessment': '',
                'strengths': [],
                'weaknesses': [],
                'recommendation': '',
                'next_steps': ''
            }
            
            current_section = None
            for line in text.split('\n'):
                line = line.strip()
                if line.lower().startswith('overall:'):
                    analysis['overall_assessment'] = line.split(':', 1)[1].strip()
                    current_section = 'overall'
                elif line.lower().startswith('strengths:'):
                    current_section = 'strengths'
                elif line.lower().startswith('improvements:') or line.lower().startswith('areas for improvement:'):
                    current_section = 'improvements'
                elif line.lower().startswith('recommendation:'):
                    analysis['recommendation'] = line.split(':', 1)[1].strip()
                    current_section = 'recommendation'
                elif line.lower().startswith('next steps:'):
                    analysis['next_steps'] = line.split(':', 1)[1].strip()
                    current_section = 'next_steps'
                elif line.startswith('-') or line.startswith('•'):
                    item = line.lstrip('-• ').strip()
                    if current_section == 'strengths' and item:
                        analysis['strengths'].append(item)
                    elif current_section == 'improvements' and item:
                        analysis['weaknesses'].append(item)
            
            print(f"✅ Parsed final analysis - {len(analysis['strengths'])} strengths, {len(analysis['weaknesses'])} improvements")
            return analysis
            
        except Exception as e:
            print(f"❌ Error generating final analysis: {e}")
            import traceback
            traceback.print_exc()
            return self._generate_fallback_final_analysis(interview_data, responses_data)
    
    def _generate_fallback_final_analysis(self, interview_data, responses_data):
        """Fallback final analysis when AI service is unavailable"""
        avg_score = interview_data.get('avg_score', 0)
        return {
            'overall_assessment': f"{interview_data.get('candidate_name', 'Candidate')} completed the interview with an average score of {avg_score}/100.",
            'strengths': [
                'Completed all interview questions',
                'Demonstrated engagement throughout the process',
                f"Achieved {avg_score}/100 overall score"
            ],
            'weaknesses': [
                'Areas for technical depth improvement' if avg_score < 80 else 'Continue building on strong foundation',
                'Could provide more detailed examples'
            ],
            'recommendation': 'Recommended for next round' if avg_score >= 70 else 'Consider for future opportunities',
            'next_steps': 'Schedule technical round' if avg_score >= 80 else 'Review and provide feedback'
        }