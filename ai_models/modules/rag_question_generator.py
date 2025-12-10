"""
RAG Question Generator Module
Generates interview questions from job descriptions and CVs using LangChain + ChromaDB
"""
import json
import logging
from typing import List, Dict, Any, Optional
from pathlib import Path

# Import will work when run in the proper environment
try:
    from langchain.text_splitter import CharacterTextSplitter
    from langchain.embeddings import HuggingFaceEmbeddings
    from langchain.vectorstores import Chroma
    from langchain.llms import OpenAI
    from langchain.chains import RetrievalQA
    from langchain.schema import Document
    import openai
    
    print("✅ All imports successful for RAG Question Generator.")
except ImportError as e:
    print(f"Warning: Some imports failed - {e}. Module will work in proper environment.")

logger = logging.getLogger(__name__)

class RAGQuestionGenerator:
    """RAG-based question generator for interviews"""
    
    def __init__(self, openai_api_key: Optional[str] = None):
        """
        Initialize RAG Question Generator
        
        Args:
            openai_api_key: OpenAI API key for question generation
        """
        self.openai_api_key = openai_api_key
        self.embeddings = None
        self.vectorstore = None
        self.qa_chain = None
        self.knowledge_base = []
        
        # Question templates by category
        self.question_templates = {
            "technical": [
                "Based on your experience with {skill}, can you explain how you would {scenario}?",
                "What challenges have you faced when working with {technology}?",
                "How would you approach {problem} using {skill}?",
                "Can you walk me through your process for {task}?"
            ],
            "behavioral": [
                "Tell me about a time when you had to {situation}.",
                "Describe a situation where you {challenge}.",
                "How do you handle {scenario}?",
                "Give me an example of when you {achievement}."
            ],
            "experience": [
                "In your role as {position}, what was your biggest accomplishment?",
                "How did your experience at {company} prepare you for this role?",
                "What project are you most proud of from your time at {company}?",
                "Describe your responsibilities in {role}."
            ],
            "role_specific": [
                "For this {position} role, how would you {responsibility}?",
                "What interests you most about {company} and this {position} position?",
                "How do you see yourself contributing to {department}?",
                "What would be your approach to {key_requirement}?"
            ]
        }
        
    def setup_embeddings(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        """Setup embedding model"""
        try:
            self.embeddings = HuggingFaceEmbeddings(model_name=model_name)
            logger.info(f"Embeddings initialized with model: {model_name}")
            return True
        except Exception as e:
            logger.error(f"Failed to initialize embeddings: {e}")
            return False
    
    def create_knowledge_base(self, cv_text: str, job_description: str, company_info: str = "") -> bool:
        """
        Create knowledge base from CV and job description
        
        Args:
            cv_text: Candidate's CV text
            job_description: Job posting description
            company_info: Additional company information
            
        Returns:
            Success status
        """
        try:
            # Prepare documents
            documents = []
            
            # Add CV content
            cv_doc = Document(
                page_content=cv_text,
                metadata={"source": "cv", "type": "candidate_profile"}
            )
            documents.append(cv_doc)
            
            # Add job description
            job_doc = Document(
                page_content=job_description,
                metadata={"source": "job_description", "type": "requirements"}
            )
            documents.append(job_doc)
            
            # Add company info if provided
            if company_info.strip():
                company_doc = Document(
                    page_content=company_info,
                    metadata={"source": "company_info", "type": "context"}
                )
                documents.append(company_doc)
            
            # Split documents
            text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
            splits = text_splitter.split_documents(documents)
            
            # Create vector store
            if not self.embeddings:
                if not self.setup_embeddings():
                    return False
            
            self.vectorstore = Chroma.from_documents(
                documents=splits,
                embedding=self.embeddings,
                persist_directory="./chroma_db"
            )
            
            # Setup QA chain
            if self.openai_api_key:
                llm = OpenAI(openai_api_key=self.openai_api_key, temperature=0.7)
                self.qa_chain = RetrievalQA.from_chain_type(
                    llm=llm,
                    chain_type="stuff",
                    retriever=self.vectorstore.as_retriever()
                )
            
            self.knowledge_base = documents
            logger.info(f"Knowledge base created with {len(splits)} chunks")
            return True
            
        except Exception as e:
            logger.error(f"Failed to create knowledge base: {e}")
            return False
    
    def extract_key_information(self, cv_text: str, job_description: str) -> Dict[str, Any]:
        """
        Extract key information from CV and job description
        
        Args:
            cv_text: Candidate's CV text
            job_description: Job posting description
            
        Returns:
            Extracted information dictionary
        """
        try:
            # Extract from CV
            cv_info = self._extract_cv_info(cv_text)
            
            # Extract from job description
            job_info = self._extract_job_info(job_description)
            
            # Find skill gaps and matches
            skill_analysis = self._analyze_skills(cv_info["skills"], job_info["required_skills"])
            
            extracted_info = {
                "candidate": cv_info,
                "job": job_info,
                "skill_analysis": skill_analysis,
                "focus_areas": self._identify_focus_areas(cv_info, job_info, skill_analysis)
            }
            
            return extracted_info
            
        except Exception as e:
            logger.error(f"Information extraction failed: {e}")
            return {}
    
    def generate_questions(self, extracted_info: Dict[str, Any], num_questions: int = 10) -> List[Dict[str, Any]]:
        """
        Generate interview questions based on extracted information
        
        Args:
            extracted_info: Information extracted from CV and job description
            num_questions: Number of questions to generate
            
        Returns:
            List of generated questions with metadata
        """
        try:
            questions = []
            categories = ["technical", "behavioral", "experience", "role_specific"]
            questions_per_category = max(1, num_questions // len(categories))
            
            for category in categories:
                category_questions = self._generate_category_questions(
                    category, extracted_info, questions_per_category
                )
                questions.extend(category_questions)
            
            # Trim to requested number
            questions = questions[:num_questions]
            
            # Add follow-up questions
            for question in questions:
                question["follow_ups"] = self._generate_follow_up_questions(question)
            
            logger.info(f"Generated {len(questions)} questions")
            return questions
            
        except Exception as e:
            logger.error(f"Question generation failed: {e}")
            return []
    
    def _extract_cv_info(self, cv_text: str) -> Dict[str, Any]:
        """Extract information from CV text"""
        # Simple keyword-based extraction (can be enhanced with NLP)
        skills_keywords = ["python", "java", "javascript", "react", "node.js", "sql", "machine learning", 
                          "data science", "aws", "docker", "kubernetes", "git", "agile", "scrum"]
        
        experience_keywords = ["years", "experience", "worked", "developed", "managed", "led", "created"]
        
        cv_lower = cv_text.lower()
        
        # Extract skills
        found_skills = [skill for skill in skills_keywords if skill in cv_lower]
        
        # Extract experience level (simple heuristic)
        experience_level = "entry"
        if "senior" in cv_lower or "lead" in cv_lower:
            experience_level = "senior"
        elif "mid" in cv_lower or "3" in cv_lower or "4" in cv_lower or "5" in cv_lower:
            experience_level = "mid"
        
        # Extract companies (simple - look for common patterns)
        companies = []
        lines = cv_text.split('\n')
        for line in lines:
            if any(word in line.lower() for word in ["inc", "corp", "ltd", "company", "technologies"]):
                companies.append(line.strip())
        
        return {
            "skills": found_skills,
            "experience_level": experience_level,
            "companies": companies[:3],  # Top 3
            "raw_text": cv_text
        }
    
    def _extract_job_info(self, job_description: str) -> Dict[str, Any]:
        """Extract information from job description"""
        job_lower = job_description.lower()
        
        # Extract required skills
        skill_indicators = ["required", "must have", "experience with", "proficient in", "knowledge of"]
        skills_section = ""
        for indicator in skill_indicators:
            if indicator in job_lower:
                start_idx = job_lower.find(indicator)
                skills_section += job_description[start_idx:start_idx+200] + " "
        
        # Extract role type
        role_type = "developer"
        if "manager" in job_lower:
            role_type = "manager"
        elif "analyst" in job_lower:
            role_type = "analyst"
        elif "engineer" in job_lower:
            role_type = "engineer"
        
        # Extract seniority
        seniority = "mid"
        if "senior" in job_lower or "lead" in job_lower:
            seniority = "senior"
        elif "junior" in job_lower or "entry" in job_lower:
            seniority = "junior"
        
        return {
            "required_skills": self._extract_skills_from_text(skills_section),
            "role_type": role_type,
            "seniority": seniority,
            "raw_text": job_description
        }
    
    def _extract_skills_from_text(self, text: str) -> List[str]:
        """Extract skills from text"""
        common_skills = ["python", "java", "javascript", "react", "angular", "vue", "node.js", 
                        "sql", "mongodb", "postgresql", "aws", "azure", "docker", "kubernetes",
                        "machine learning", "data science", "tensorflow", "pytorch", "git"]
        
        text_lower = text.lower()
        return [skill for skill in common_skills if skill in text_lower]
    
    def _analyze_skills(self, candidate_skills: List[str], required_skills: List[str]) -> Dict[str, Any]:
        """Analyze skill match between candidate and requirements"""
        matching_skills = list(set(candidate_skills) & set(required_skills))
        missing_skills = list(set(required_skills) - set(candidate_skills))
        extra_skills = list(set(candidate_skills) - set(required_skills))
        
        match_percentage = len(matching_skills) / len(required_skills) if required_skills else 1.0
        
        return {
            "matching_skills": matching_skills,
            "missing_skills": missing_skills,
            "extra_skills": extra_skills,
            "match_percentage": match_percentage,
            "skill_gaps": missing_skills
        }
    
    def _identify_focus_areas(self, cv_info: Dict, job_info: Dict, skill_analysis: Dict) -> List[str]:
        """Identify key areas to focus on during interview"""
        focus_areas = []
        
        # Focus on skill gaps
        if skill_analysis["missing_skills"]:
            focus_areas.append("skill_gaps")
        
        # Focus on experience level match
        if cv_info["experience_level"] != job_info["seniority"]:
            focus_areas.append("experience_level")
        
        # Focus on matching skills (strengths)
        if skill_analysis["matching_skills"]:
            focus_areas.append("technical_strengths")
        
        # Always include behavioral assessment
        focus_areas.append("behavioral_assessment")
        
        return focus_areas
    
    def _generate_category_questions(self, category: str, extracted_info: Dict, count: int) -> List[Dict[str, Any]]:
        """Generate questions for a specific category"""
        questions = []
        templates = self.question_templates.get(category, [])
        
        candidate_info = extracted_info.get("candidate", {})
        job_info = extracted_info.get("job", {})
        skill_analysis = extracted_info.get("skill_analysis", {})
        
        for i in range(min(count, len(templates))):
            template = templates[i]
            
            # Fill template based on category
            if category == "technical":
                if skill_analysis.get("matching_skills"):
                    skill = skill_analysis["matching_skills"][0]
                    question_text = template.format(
                        skill=skill,
                        technology=skill,
                        scenario="solve a complex problem",
                        problem="performance optimization",
                        task="code review"
                    )
                else:
                    question_text = "Can you walk me through your development process?"
            
            elif category == "behavioral":
                situation_options = ["work under pressure", "resolve team conflicts", "meet tight deadlines"]
                situation = situation_options[i % len(situation_options)]
                question_text = template.format(
                    situation=situation,
                    challenge=situation,
                    scenario="challenging projects",
                    achievement="exceeded expectations"
                )
            
            elif category == "experience":
                companies = candidate_info.get("companies", ["your previous company"])
                company = companies[0] if companies else "your previous company"
                question_text = template.format(
                    position=job_info.get("role_type", "developer"),
                    company=company,
                    role=candidate_info.get("experience_level", "developer")
                )
            
            elif category == "role_specific":
                question_text = template.format(
                    position=job_info.get("role_type", "this position"),
                    company="our company",
                    department="the team",
                    responsibility="handle the key responsibilities",
                    key_requirement="project management"
                )
            
            questions.append({
                "id": f"{category}_{i+1}",
                "category": category,
                "question": question_text,
                "difficulty": self._assess_question_difficulty(category, extracted_info),
                "expected_duration": self._estimate_answer_duration(category),
                "evaluation_criteria": self._get_evaluation_criteria(category),
                "tags": self._generate_question_tags(category, extracted_info)
            })
        
        return questions
    
    def _generate_follow_up_questions(self, main_question: Dict[str, Any]) -> List[str]:
        """Generate follow-up questions based on main question"""
        category = main_question["category"]
        
        follow_ups = {
            "technical": [
                "Can you explain that in more detail?",
                "What alternatives did you consider?",
                "How would you handle edge cases?"
            ],
            "behavioral": [
                "What was the outcome?",
                "What would you do differently?",
                "How did you measure success?"
            ],
            "experience": [
                "What challenges did you face?",
                "What did you learn from that experience?",
                "How did that prepare you for this role?"
            ],
            "role_specific": [
                "Can you be more specific?",
                "How would you prioritize that?",
                "What resources would you need?"
            ]
        }
        
        return follow_ups.get(category, ["Can you elaborate on that?"])
    
    def _assess_question_difficulty(self, category: str, extracted_info: Dict) -> str:
        """Assess question difficulty based on candidate profile"""
        experience_level = extracted_info.get("candidate", {}).get("experience_level", "mid")
        
        if experience_level == "senior":
            return "hard"
        elif experience_level == "entry":
            return "easy"
        else:
            return "medium"
    
    def _estimate_answer_duration(self, category: str) -> int:
        """Estimate expected answer duration in seconds"""
        durations = {
            "technical": 180,  # 3 minutes
            "behavioral": 240,  # 4 minutes
            "experience": 150,  # 2.5 minutes
            "role_specific": 120  # 2 minutes
        }
        return durations.get(category, 120)
    
    def _get_evaluation_criteria(self, category: str) -> List[str]:
        """Get evaluation criteria for question category"""
        criteria = {
            "technical": ["accuracy", "depth", "problem_solving", "best_practices"],
            "behavioral": ["communication", "leadership", "adaptability", "teamwork"],
            "experience": ["relevance", "achievements", "learning", "growth"],
            "role_specific": ["understanding", "enthusiasm", "fit", "preparation"]
        }
        return criteria.get(category, ["clarity", "completeness"])
    
    def _generate_question_tags(self, category: str, extracted_info: Dict) -> List[str]:
        """Generate tags for questions"""
        tags = [category]
        
        # Add skill-based tags
        matching_skills = extracted_info.get("skill_analysis", {}).get("matching_skills", [])
        tags.extend(matching_skills[:2])  # Add top 2 matching skills
        
        # Add experience level tag
        experience_level = extracted_info.get("candidate", {}).get("experience_level", "")
        if experience_level:
            tags.append(experience_level)
        
        return tags

def demo_rag_question_generator():
    """Demo function to test RAG Question Generator"""
    print("=== RAG Question Generator Demo ===")
    
    # Sample CV and job description
    sample_cv = """
    John Doe
    Senior Software Engineer
    
    Experience:
    - 5 years of Python development at TechCorp Inc
    - Led team of 4 developers
    - Built machine learning models using TensorFlow
    - Experience with AWS, Docker, and Kubernetes
    - Proficient in React and Node.js
    
    Skills: Python, JavaScript, React, TensorFlow, AWS, Docker, Git, Agile
    """
    
    sample_job_description = """
    Senior Full Stack Developer Position
    
    We are looking for a Senior Full Stack Developer to join our team.
    
    Required Skills:
    - 5+ years experience with Python and JavaScript
    - Experience with React and Node.js
    - Knowledge of cloud platforms (AWS preferred)
    - Experience with containerization (Docker)
    - Strong problem-solving skills
    - Leadership experience preferred
    
    Responsibilities:
    - Lead development of web applications
    - Mentor junior developers
    - Architect scalable solutions
    """
    
    # Initialize generator
    generator = RAGQuestionGenerator()
    
    print("Extracting key information...")
    extracted_info = generator.extract_key_information(sample_cv, sample_job_description)
    
    print(f"\nCandidate Skills: {extracted_info['candidate']['skills']}")
    print(f"Required Skills: {extracted_info['job']['required_skills']}")
    print(f"Skill Match: {extracted_info['skill_analysis']['match_percentage']:.1%}")
    print(f"Missing Skills: {extracted_info['skill_analysis']['missing_skills']}")
    
    print("\nGenerating questions...")
    questions = generator.generate_questions(extracted_info, num_questions=8)
    
    print(f"\n=== Generated {len(questions)} Questions ===")
    for i, q in enumerate(questions, 1):
        print(f"\n{i}. [{q['category'].upper()}] {q['question']}")
        print(f"   Difficulty: {q['difficulty']} | Duration: {q['expected_duration']}s")
        print(f"   Follow-ups: {', '.join(q['follow_ups'][:2])}")
    
    return questions

if __name__ == "__main__":
    demo_rag_question_generator()