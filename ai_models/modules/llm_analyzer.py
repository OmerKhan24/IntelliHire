"""
LLM Confidence & Analysis Module
Analyzes candidate responses using OpenAI GPT for confidence, competency, and follow-up questions
"""
import json
import logging
import time
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

# Imports will work when run in proper environment
try:
    import openai
except ImportError as e:
    print(f"Warning: OpenAI import failed - {e}. Module will work in proper environment.")

logger = logging.getLogger(__name__)

class ConfidenceLevel(Enum):
    VERY_LOW = "very_low"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very_high"

class CompetencyLevel(Enum):
    NOVICE = "novice"
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"

@dataclass
class AnalysisResult:
    """Result of LLM analysis"""
    confidence_level: ConfidenceLevel
    competency_level: CompetencyLevel
    confidence_score: float  # 0-1
    competency_score: float  # 0-1
    key_strengths: List[str]
    areas_for_improvement: List[str]
    technical_accuracy: float
    communication_clarity: float
    depth_of_knowledge: float
    problem_solving_approach: float
    follow_up_questions: List[str]
    red_flags: List[str]
    positive_indicators: List[str]
    analysis_reasoning: str

class LLMAnalyzer:
    """LLM-based analyzer for interview responses"""
    
    def __init__(self, api_key: Optional[str] = None, model: str = "gpt-3.5-turbo"):
        """
        Initialize LLM Analyzer
        
        Args:
            api_key: OpenAI API key
            model: OpenAI model to use
        """
        self.api_key = api_key
        self.model = model
        self.client = None
        
        if api_key:
            try:
                openai.api_key = api_key
                self.client = openai
            except Exception as e:
                logger.error(f"Failed to initialize OpenAI client: {e}")
        
        # Analysis prompts
        self.prompts = {
            "confidence_analysis": """
Analyze the following interview response for confidence level. Consider:
- Language certainty vs uncertainty (e.g., "I think", "maybe", "definitely")
- Response completeness and detail
- Use of filler words and hesitations
- Assertiveness in statements
- Specific examples vs vague descriptions

Question: {question}
Response: {response}
Additional Context: {context}

Provide analysis in JSON format:
{{
    "confidence_score": <0-1>,
    "confidence_level": "<very_low|low|medium|high|very_high>",
    "confidence_indicators": ["<specific phrases or behaviors>"],
    "uncertainty_markers": ["<hesitation phrases or qualifiers>"],
    "reasoning": "<explanation of assessment>"
}}
""",
            
            "competency_analysis": """
Analyze the following interview response for technical/professional competency:
- Accuracy of technical information
- Depth of understanding
- Use of appropriate terminology
- Problem-solving approach
- Real-world application knowledge
- Best practices awareness

Question Category: {category}
Question: {question}
Response: {response}
Expected Skills: {expected_skills}

Provide analysis in JSON format:
{{
    "competency_score": <0-1>,
    "competency_level": "<novice|beginner|intermediate|advanced|expert>",
    "technical_accuracy": <0-1>,
    "depth_score": <0-1>,
    "terminology_usage": <0-1>,
    "practical_knowledge": <0-1>,
    "strengths": ["<specific strengths>"],
    "gaps": ["<knowledge gaps or errors>"],
    "reasoning": "<detailed explanation>"
}}
""",
            
            "communication_analysis": """
Analyze the communication quality of this interview response:
- Clarity and structure
- Use of examples
- Logical flow
- Completeness of answer
- Professional language

Question: {question}
Response: {response}

Provide analysis in JSON format:
{{
    "communication_score": <0-1>,
    "clarity": <0-1>,
    "structure": <0-1>,
    "completeness": <0-1>,
    "professionalism": <0-1>,
    "positive_aspects": ["<communication strengths>"],
    "improvement_areas": ["<areas to improve>"],
    "reasoning": "<explanation>"
}}
""",
            
            "follow_up_generator": """
Based on the candidate's response, generate relevant follow-up questions that would:
- Probe deeper into their knowledge
- Clarify ambiguous statements
- Test practical application
- Explore edge cases or challenges
- Assess problem-solving skills

Original Question: {question}
Candidate Response: {response}
Question Category: {category}

Generate 3-5 follow-up questions in JSON format:
{{
    "follow_up_questions": [
        {{
            "question": "<follow-up question>",
            "purpose": "<why this question is relevant>",
            "difficulty": "<easy|medium|hard>",
            "type": "<clarification|deep_dive|practical|edge_case>"
        }}
    ],
    "priority_order": ["<order of importance>"],
    "reasoning": "<why these follow-ups are valuable>"
}}
""",
            
            "red_flag_detection": """
Analyze this interview response for potential red flags or concerning patterns:
- Possible plagiarism or memorized answers
- Inconsistencies with claimed experience
- Overconfidence without substance
- Evasiveness or non-answers
- Inappropriate responses
- Potential dishonesty indicators

Question: {question}
Response: {response}
Candidate Profile: {profile}

Identify any red flags in JSON format:
{{
    "red_flags": [
        {{
            "type": "<type of red flag>",
            "severity": "<low|medium|high|critical>",
            "description": "<what was concerning>",
            "evidence": "<specific text or patterns>"
        }}
    ],
    "overall_concern_level": "<low|medium|high|critical>",
    "positive_indicators": ["<genuinely positive aspects>"],
    "reasoning": "<overall assessment>"
}}
"""
        }
    
    def analyze_response(
        self, 
        question: str, 
        response: str, 
        question_category: str = "general",
        expected_skills: List[str] = None,
        candidate_profile: Dict[str, Any] = None,
        context: str = ""
    ) -> AnalysisResult:
        """
        Comprehensive analysis of interview response
        
        Args:
            question: The interview question asked
            response: Candidate's response
            question_category: Category of question (technical, behavioral, etc.)
            expected_skills: List of expected skills for this question
            candidate_profile: Information about the candidate
            context: Additional context about the interview
            
        Returns:
            Comprehensive analysis result
        """
        try:
            # Initialize results with defaults
            confidence_data = self._analyze_confidence(question, response, context)
            competency_data = self._analyze_competency(
                question, response, question_category, expected_skills or []
            )
            communication_data = self._analyze_communication(question, response)
            follow_up_data = self._generate_follow_ups(question, response, question_category)
            red_flag_data = self._detect_red_flags(question, response, candidate_profile or {})
            
            # Combine all analyses
            result = AnalysisResult(
                confidence_level=ConfidenceLevel(confidence_data.get("confidence_level", "medium")),
                competency_level=CompetencyLevel(competency_data.get("competency_level", "intermediate")),
                confidence_score=confidence_data.get("confidence_score", 0.5),
                competency_score=competency_data.get("competency_score", 0.5),
                key_strengths=competency_data.get("strengths", []),
                areas_for_improvement=competency_data.get("gaps", []),
                technical_accuracy=competency_data.get("technical_accuracy", 0.5),
                communication_clarity=communication_data.get("clarity", 0.5),
                depth_of_knowledge=competency_data.get("depth_score", 0.5),
                problem_solving_approach=competency_data.get("practical_knowledge", 0.5),
                follow_up_questions=[q["question"] for q in follow_up_data.get("follow_up_questions", [])],
                red_flags=[f"{rf['type']}: {rf['description']}" for rf in red_flag_data.get("red_flags", [])],
                positive_indicators=red_flag_data.get("positive_indicators", []),
                analysis_reasoning=self._combine_reasoning(
                    confidence_data, competency_data, communication_data
                )
            )
            
            return result
            
        except Exception as e:
            logger.error(f"Analysis failed: {e}")
            return self._get_default_analysis()
    
    def _analyze_confidence(self, question: str, response: str, context: str) -> Dict[str, Any]:
        """Analyze confidence level in response"""
        try:
            if self.client and self.api_key:
                # Use actual OpenAI API
                return self._call_openai_analysis("confidence_analysis", {
                    "question": question,
                    "response": response,
                    "context": context
                })
            else:
                # Fallback to rule-based analysis
                return self._rule_based_confidence_analysis(response)
                
        except Exception as e:
            logger.error(f"Confidence analysis failed: {e}")
            return self._rule_based_confidence_analysis(response)
    
    def _analyze_competency(
        self, 
        question: str, 
        response: str, 
        category: str, 
        expected_skills: List[str]
    ) -> Dict[str, Any]:
        """Analyze technical/professional competency"""
        try:
            if self.client and self.api_key:
                return self._call_openai_analysis("competency_analysis", {
                    "question": question,
                    "response": response,
                    "category": category,
                    "expected_skills": ", ".join(expected_skills)
                })
            else:
                return self._rule_based_competency_analysis(response, expected_skills)
                
        except Exception as e:
            logger.error(f"Competency analysis failed: {e}")
            return self._rule_based_competency_analysis(response, expected_skills)
    
    def _analyze_communication(self, question: str, response: str) -> Dict[str, Any]:
        """Analyze communication quality"""
        try:
            if self.client and self.api_key:
                return self._call_openai_analysis("communication_analysis", {
                    "question": question,
                    "response": response
                })
            else:
                return self._rule_based_communication_analysis(response)
                
        except Exception as e:
            logger.error(f"Communication analysis failed: {e}")
            return self._rule_based_communication_analysis(response)
    
    def _generate_follow_ups(self, question: str, response: str, category: str) -> Dict[str, Any]:
        """Generate follow-up questions"""
        try:
            if self.client and self.api_key:
                return self._call_openai_analysis("follow_up_generator", {
                    "question": question,
                    "response": response,
                    "category": category
                })
            else:
                return self._rule_based_follow_ups(question, response, category)
                
        except Exception as e:
            logger.error(f"Follow-up generation failed: {e}")
            return self._rule_based_follow_ups(question, response, category)
    
    def _detect_red_flags(self, question: str, response: str, profile: Dict[str, Any]) -> Dict[str, Any]:
        """Detect potential red flags"""
        try:
            if self.client and self.api_key:
                return self._call_openai_analysis("red_flag_detection", {
                    "question": question,
                    "response": response,
                    "profile": json.dumps(profile)
                })
            else:
                return self._rule_based_red_flag_detection(response)
                
        except Exception as e:
            logger.error(f"Red flag detection failed: {e}")
            return self._rule_based_red_flag_detection(response)
    
    def _call_openai_analysis(self, prompt_type: str, variables: Dict[str, str]) -> Dict[str, Any]:
        """Call OpenAI API for analysis"""
        try:
            prompt = self.prompts[prompt_type].format(**variables)
            
            response = self.client.ChatCompletion.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an expert interview analyst. Provide detailed, objective analysis in the requested JSON format."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=1000
            )
            
            content = response.choices[0].message.content
            
            # Extract JSON from response
            try:
                # Find JSON in the response
                start_idx = content.find('{')
                end_idx = content.rfind('}') + 1
                json_str = content[start_idx:end_idx]
                return json.loads(json_str)
            except (json.JSONDecodeError, ValueError):
                logger.warning("Failed to parse OpenAI JSON response")
                return {}
                
        except Exception as e:
            logger.error(f"OpenAI API call failed: {e}")
            return {}
    
    def _rule_based_confidence_analysis(self, response: str) -> Dict[str, Any]:
        """Rule-based confidence analysis as fallback"""
        response_lower = response.lower()
        
        # Confidence indicators
        confident_phrases = ["definitely", "certainly", "absolutely", "confident", "sure", "exactly"]
        uncertain_phrases = ["i think", "maybe", "perhaps", "might", "probably", "not sure", "um", "uh"]
        
        confident_count = sum(phrase in response_lower for phrase in confident_phrases)
        uncertain_count = sum(phrase in response_lower for phrase in uncertain_phrases)
        
        # Calculate confidence score
        total_indicators = confident_count + uncertain_count
        if total_indicators == 0:
            confidence_score = 0.6  # Neutral
        else:
            confidence_score = confident_count / total_indicators
        
        # Adjust based on response length and detail
        if len(response.split()) > 50:  # Detailed response
            confidence_score += 0.1
        if len(response.split()) < 10:  # Very short response
            confidence_score -= 0.2
        
        confidence_score = max(0, min(1, confidence_score))
        
        # Determine confidence level
        if confidence_score >= 0.8:
            level = "very_high"
        elif confidence_score >= 0.6:
            level = "high"
        elif confidence_score >= 0.4:
            level = "medium"
        elif confidence_score >= 0.2:
            level = "low"
        else:
            level = "very_low"
        
        return {
            "confidence_score": confidence_score,
            "confidence_level": level,
            "confidence_indicators": [p for p in confident_phrases if p in response_lower],
            "uncertainty_markers": [p for p in uncertain_phrases if p in response_lower],
            "reasoning": f"Based on language patterns: {confident_count} confident vs {uncertain_count} uncertain indicators"
        }
    
    def _rule_based_competency_analysis(self, response: str, expected_skills: List[str]) -> Dict[str, Any]:
        """Rule-based competency analysis"""
        response_lower = response.lower()
        
        # Check for technical terms
        skill_mentions = sum(1 for skill in expected_skills if skill.lower() in response_lower)
        skill_coverage = skill_mentions / len(expected_skills) if expected_skills else 0.5
        
        # Check for depth indicators
        depth_indicators = ["example", "experience", "project", "implementation", "challenges", "solution"]
        depth_count = sum(1 for indicator in depth_indicators if indicator in response_lower)
        depth_score = min(1.0, depth_count / 3)
        
        # Calculate overall competency
        competency_score = (skill_coverage * 0.4 + depth_score * 0.6)
        
        # Determine competency level
        if competency_score >= 0.8:
            level = "expert"
        elif competency_score >= 0.6:
            level = "advanced"
        elif competency_score >= 0.4:
            level = "intermediate"
        elif competency_score >= 0.2:
            level = "beginner"
        else:
            level = "novice"
        
        return {
            "competency_score": competency_score,
            "competency_level": level,
            "technical_accuracy": skill_coverage,
            "depth_score": depth_score,
            "terminology_usage": skill_coverage,
            "practical_knowledge": depth_score,
            "strengths": ["Mentioned relevant skills"] if skill_mentions > 0 else [],
            "gaps": ["Limited technical detail"] if depth_score < 0.5 else [],
            "reasoning": f"Skill coverage: {skill_coverage:.1%}, Depth indicators: {depth_count}"
        }
    
    def _rule_based_communication_analysis(self, response: str) -> Dict[str, Any]:
        """Rule-based communication analysis"""
        words = response.split()
        sentences = response.split('.')
        
        # Calculate metrics
        avg_sentence_length = len(words) / max(1, len(sentences))
        clarity_score = min(1.0, 20 / max(1, avg_sentence_length))  # Prefer shorter sentences
        
        # Check structure
        structure_indicators = ["first", "second", "then", "next", "finally", "because", "therefore"]
        structure_count = sum(1 for indicator in structure_indicators if indicator.lower() in response.lower())
        structure_score = min(1.0, structure_count / 2)
        
        # Check completeness (basic heuristic)
        completeness_score = min(1.0, len(words) / 30)  # Expect at least 30 words for complete answer
        
        communication_score = (clarity_score * 0.3 + structure_score * 0.3 + completeness_score * 0.4)
        
        return {
            "communication_score": communication_score,
            "clarity": clarity_score,
            "structure": structure_score,
            "completeness": completeness_score,
            "professionalism": 0.7,  # Default professional score
            "positive_aspects": ["Clear expression"] if clarity_score > 0.6 else [],
            "improvement_areas": ["Add more structure"] if structure_score < 0.5 else [],
            "reasoning": f"Clarity: {clarity_score:.2f}, Structure: {structure_score:.2f}, Completeness: {completeness_score:.2f}"
        }
    
    def _rule_based_follow_ups(self, question: str, response: str, category: str) -> Dict[str, Any]:
        """Generate rule-based follow-up questions"""
        follow_ups = []
        
        if category == "technical":
            follow_ups = [
                {"question": "Can you walk me through your implementation approach?", "purpose": "Get technical details", "difficulty": "medium", "type": "deep_dive"},
                {"question": "What challenges might you encounter with this solution?", "purpose": "Test problem anticipation", "difficulty": "hard", "type": "edge_case"},
                {"question": "How would you test this?", "purpose": "Assess testing knowledge", "difficulty": "medium", "type": "practical"}
            ]
        elif category == "behavioral":
            follow_ups = [
                {"question": "What was the outcome of that situation?", "purpose": "Get results", "difficulty": "easy", "type": "clarification"},
                {"question": "What would you do differently next time?", "purpose": "Assess learning", "difficulty": "medium", "type": "deep_dive"},
                {"question": "How did you measure success?", "purpose": "Check metrics awareness", "difficulty": "medium", "type": "practical"}
            ]
        else:
            follow_ups = [
                {"question": "Can you provide more details about that?", "purpose": "Get elaboration", "difficulty": "easy", "type": "clarification"},
                {"question": "How does this relate to the role requirements?", "purpose": "Check role fit", "difficulty": "medium", "type": "practical"}
            ]
        
        return {
            "follow_up_questions": follow_ups,
            "priority_order": [q["question"] for q in follow_ups],
            "reasoning": f"Generated standard follow-ups for {category} category"
        }
    
    def _rule_based_red_flag_detection(self, response: str) -> Dict[str, Any]:
        """Rule-based red flag detection"""
        red_flags = []
        
        response_lower = response.lower()
        
        # Check for evasiveness
        evasive_phrases = ["i don't know", "not sure", "can't remember", "maybe someone else"]
        if any(phrase in response_lower for phrase in evasive_phrases):
            red_flags.append({
                "type": "evasiveness",
                "severity": "medium",
                "description": "Candidate appears evasive or uncertain",
                "evidence": "Uses uncertain language"
            })
        
        # Check for very short responses
        if len(response.split()) < 5:
            red_flags.append({
                "type": "insufficient_detail",
                "severity": "medium",
                "description": "Response lacks sufficient detail",
                "evidence": f"Only {len(response.split())} words"
            })
        
        # Check for overconfidence without substance
        confident_phrases = ["definitely", "absolutely", "always", "never"]
        confident_count = sum(1 for phrase in confident_phrases if phrase in response_lower)
        if confident_count > 2 and len(response.split()) < 20:
            red_flags.append({
                "type": "overconfidence",
                "severity": "low",
                "description": "High confidence with little substantiation",
                "evidence": f"{confident_count} confident statements in short response"
            })
        
        return {
            "red_flags": red_flags,
            "overall_concern_level": "medium" if red_flags else "low",
            "positive_indicators": ["Provided detailed response"] if len(response.split()) > 30 else [],
            "reasoning": f"Found {len(red_flags)} potential concerns"
        }
    
    def _combine_reasoning(self, confidence_data: Dict, competency_data: Dict, communication_data: Dict) -> str:
        """Combine reasoning from all analyses"""
        reasoning_parts = [
            f"Confidence: {confidence_data.get('reasoning', 'N/A')}",
            f"Competency: {competency_data.get('reasoning', 'N/A')}",
            f"Communication: {communication_data.get('reasoning', 'N/A')}"
        ]
        return " | ".join(reasoning_parts)
    
    def _get_default_analysis(self) -> AnalysisResult:
        """Return default analysis when other methods fail"""
        return AnalysisResult(
            confidence_level=ConfidenceLevel.MEDIUM,
            competency_level=CompetencyLevel.INTERMEDIATE,
            confidence_score=0.5,
            competency_score=0.5,
            key_strengths=["Participated in interview"],
            areas_for_improvement=["Analysis temporarily unavailable"],
            technical_accuracy=0.5,
            communication_clarity=0.5,
            depth_of_knowledge=0.5,
            problem_solving_approach=0.5,
            follow_up_questions=["Can you elaborate on your response?"],
            red_flags=[],
            positive_indicators=["Engaged in conversation"],
            analysis_reasoning="Default analysis due to system limitations"
        )

def demo_llm_analyzer():
    """Demo function to test LLM Analyzer module"""
    print("=== LLM Confidence & Analysis Demo ===")
    
    # Initialize analyzer
    analyzer = LLMAnalyzer()  # No API key for demo
    
    # Sample interview scenarios
    scenarios = [
        {
            "question": "How would you implement a REST API for user authentication?",
            "response": "I would definitely use JWT tokens for authentication. I've implemented this many times before. First, I'd create endpoints for login and registration, then use middleware to verify tokens on protected routes. I'd also implement refresh tokens for security.",
            "category": "technical",
            "expected_skills": ["REST API", "JWT", "authentication", "middleware"]
        },
        {
            "question": "Tell me about a time you had to work with a difficult team member.",
            "response": "Um, well, I think there was this one time... maybe it was when we had disagreements about the project approach. I'm not sure exactly how I handled it, but I think we eventually worked it out somehow.",
            "category": "behavioral",
            "expected_skills": []
        },
        {
            "question": "What interests you about this Python developer position?",
            "response": "I absolutely love Python! I've been coding in Python for 5 years and have built several machine learning models. I'm particularly excited about your company's focus on AI applications because I've worked with TensorFlow and PyTorch extensively. I believe my experience with data processing and API development would be valuable for your team.",
            "category": "role_specific",
            "expected_skills": ["Python", "machine learning", "TensorFlow", "PyTorch"]
        }
    ]
    
    print("Analyzing interview responses...\n")
    
    for i, scenario in enumerate(scenarios, 1):
        print(f"=== Scenario {i}: {scenario['category'].title()} Question ===")
        print(f"Question: {scenario['question']}")
        print(f"Response: {scenario['response']}")
        
        # Analyze response
        analysis = analyzer.analyze_response(
            question=scenario['question'],
            response=scenario['response'],
            question_category=scenario['category'],
            expected_skills=scenario['expected_skills']
        )
        
        print(f"\n--- Analysis Results ---")
        print(f"Confidence Level: {analysis.confidence_level.value} ({analysis.confidence_score:.2f})")
        print(f"Competency Level: {analysis.competency_level.value} ({analysis.competency_score:.2f})")
        print(f"Technical Accuracy: {analysis.technical_accuracy:.2f}")
        print(f"Communication Clarity: {analysis.communication_clarity:.2f}")
        
        if analysis.key_strengths:
            print(f"Strengths: {', '.join(analysis.key_strengths)}")
        
        if analysis.areas_for_improvement:
            print(f"Improvement Areas: {', '.join(analysis.areas_for_improvement)}")
        
        if analysis.follow_up_questions:
            print(f"Follow-up Questions:")
            for j, follow_up in enumerate(analysis.follow_up_questions[:2], 1):
                print(f"  {j}. {follow_up}")
        
        if analysis.red_flags:
            print(f"Red Flags: {', '.join(analysis.red_flags)}")
        
        print(f"Overall Assessment: {analysis.analysis_reasoning}")
        print("\n" + "="*80 + "\n")
    
    # Generate summary
    print("=== Summary Insights ===")
    print("The LLM analyzer evaluates:")
    print("• Confidence levels based on language patterns")
    print("• Technical competency through skill demonstration")
    print("• Communication quality and clarity")
    print("• Generates relevant follow-up questions")
    print("• Identifies potential red flags or concerns")
    print("• Provides actionable feedback for decision-making")
    
    return scenarios

if __name__ == "__main__":
    demo_llm_analyzer()