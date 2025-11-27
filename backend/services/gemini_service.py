import os
import asyncio
from concurrent.futures import ThreadPoolExecutor
import google.generativeai as genai
from gtts import gTTS
import tempfile


class GeminiService:
    def __init__(self):
        self.executor = ThreadPoolExecutor(max_workers=3)
        api_key = os.environ.get('GEMINI_API_KEY')
        if api_key:
            genai.configure(api_key=api_key)
            self.text_model = genai.GenerativeModel('gemini-pro')
            self.enabled = True
        else:
            self.text_model = None
            self.enabled = False
            print("GEMINI_API_KEY not found - running in fallback mode")
    
    async def generate_questions(self, job_description, requirements, num_questions=5, cv_text=None):
        """
        Generate interview questions with RAG using candidate's CV
        
        Args:
            job_description: Job description text
            requirements: Job requirements
            num_questions: Number of questions to generate
            cv_text: Candidate's CV text for personalized RAG-powered questions
        """
        if not self.enabled:
            return self._generate_fallback_questions(job_description, requirements, num_questions)
        
        try:
            if cv_text:
                # RAG-powered: Generate personalized questions based on CV
                prompt = f"""You are an expert interviewer. Generate {num_questions} highly personalized interview questions.

Job Description: {job_description[:500]}
Requirements: {requirements[:500]}

Candidate's CV:
{cv_text[:1500]}

Generate questions that:
1. Reference specific experiences/projects from their CV
2. Assess skills they claim to have
3. Explore gaps or transitions in their background
4. Test depth of knowledge in areas they mention
5. Evaluate fit for this specific role

Return ONLY numbered questions (1-{num_questions}), make them specific to this candidate's background."""
            else:
                # Generic questions without CV
                prompt = f"""Generate {num_questions} interview questions for the following job:
Job Description: {job_description}
Requirements: {requirements}

Return questions in this exact format:
1. [Question text here]
2. [Question text here]
...

Make questions specific, relevant, and professional."""
            
            response = await asyncio.get_event_loop().run_in_executor(
                self.executor, 
                lambda: self.text_model.generate_content(prompt)
            )
            
            text = response.text.strip()
            questions = []
            for line in text.split('\n'):
                line = line.strip()
                if line and (line[0].isdigit() or line.startswith('-')):
                    question_text = line.split('.', 1)[-1].strip() if '.' in line else line.lstrip('- ')
                    if question_text:
                        questions.append(question_text)
            
            return questions[:num_questions]
        except Exception as e:
            print(f"Error generating questions: {e}")
            return self._generate_fallback_questions(job_description, requirements, num_questions)
    
    def _generate_fallback_questions(self, job_description, requirements, num_questions):
        return [
            f"Tell me about your experience related to: {job_description[:100]}",
            f"How do you meet the requirement: {requirements[:100]}",
            "Describe a challenging project you've worked on and how you overcame obstacles.",
            "What are your greatest strengths and how do they apply to this role?",
            "Where do you see yourself in 3-5 years?"
        ][:num_questions]
    
    async def analyze_response(self, question, answer, job_context=None):
        if not self.enabled:
            return self._generate_fallback_analysis(question, answer)
        
        try:
            prompt = f"""Analyze this interview response:
Question: {question}
Answer: {answer}
Job Context: {job_context or 'General position'}

Provide:
1. Relevance score (0-100)
2. Technical competency score (0-100)
3. Communication quality score (0-100)
4. Brief feedback (2-3 sentences)

Format:
Relevance: [score]
Technical: [score]
Communication: [score]
Feedback: [feedback text]"""
            
            response = await asyncio.get_event_loop().run_in_executor(
                self.executor,
                lambda: self.text_model.generate_content(prompt)
            )
            
            text = response.text.strip()
            analysis = {'relevance_score': 70, 'technical_score': 70, 'communication_score': 70, 'feedback': text}
            
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
                elif 'feedback:' in line.lower():
                    analysis['feedback'] = line.split(':', 1)[1].strip()
            
            return analysis
        except Exception as e:
            print(f"Error analyzing response: {e}")
            return self._generate_fallback_analysis(question, answer)
    
    def _generate_fallback_analysis(self, question, answer):
        word_count = len(answer.split())
        relevance = min(100, max(30, word_count * 2))
        return {
            'relevance_score': relevance,
            'technical_score': 65,
            'communication_score': 70,
            'feedback': f"Response contains {word_count} words. Consider providing more detailed examples and specific technical information."
        }
    
    async def text_to_speech(self, text, lang='en'):
        try:
            loop = asyncio.get_event_loop()
            
            def _generate_tts():
                tts = gTTS(text=text, lang=lang, slow=False)
                temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
                tts.save(temp_file.name)
                return temp_file.name
            
            audio_path = await loop.run_in_executor(self.executor, _generate_tts)
            return audio_path
        except Exception as e:
            print(f"Error in text-to-speech: {e}")
            return None


gemini_service = GeminiService()
