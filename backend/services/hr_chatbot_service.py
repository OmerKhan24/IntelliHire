"""
HR Chatbot Service - AI-powered assistant for employee queries
Uses RAG to provide context-aware responses from company documents
Integrates with DeepSeek AI (deepseek-chat) for natural language understanding
"""

import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
import os
from openai import OpenAI

logger = logging.getLogger(__name__)


class HRChatbotService:
    """
    AI-powered HR assistant that answers employee queries using
    retrieved company documents and policies (RAG approach)
    """
    
    def __init__(self, deepseek_api_key: str, rag_service):
        """
        Initialize HR Chatbot with DeepSeek API and RAG service
        
        Args:
            deepseek_api_key: DeepSeek API key
            rag_service: HRDocumentRAGService instance for document retrieval
        """
        self.rag_service = rag_service
        self.client = OpenAI(
            api_key=deepseek_api_key,
            base_url="https://api.deepseek.com"
        )
        self.model = "deepseek-chat"
        
        # System prompt for HR assistant persona
        self.system_prompt = """You are a helpful and professional HR assistant for IntelliHire company.

Your role is to:
1. Answer employee questions about company policies, procedures, and HR-related matters
2. Provide accurate information based on the company documents provided
3. Be friendly, professional, and empathetic
4. If information is not in the documents, clearly state that and suggest contacting HR directly
5. Keep responses concise but informative (2-4 sentences typically)
6. Use bullet points for multiple items
7. Reference the source document when providing information

Guidelines:
- Never make up information not present in the retrieved documents
- Be respectful and maintain confidentiality
- For sensitive matters (compensation, disciplinary, personal), advise contacting HR directly
- If a query is ambiguous, ask clarifying questions
- Greet users warmly when they say hello/hi

Remember: You have access to company policy documents to provide accurate answers."""
        
        logger.info("✅ HR Chatbot Service initialized with DeepSeek AI (deepseek-chat)")
    
    def _format_context_from_documents(
        self, 
        retrieved_docs: List[Dict[str, Any]]
    ) -> str:
        """
        Format retrieved document chunks into context for the AI
        
        Args:
            retrieved_docs: List of document chunks with metadata
        
        Returns:
            Formatted context string
        """
        if not retrieved_docs:
            return "No relevant documents found."
        
        context_parts = []
        
        for i, doc in enumerate(retrieved_docs, 1):
            content = doc.get('content', '')
            metadata = doc.get('metadata', {})
            
            # Extract document info
            title = metadata.get('title', 'Unknown Document')
            category = metadata.get('category', 'general')
            
            # Format each document chunk
            doc_context = f"""
[Document {i}: {title} - {category}]
{content}
"""
            context_parts.append(doc_context.strip())
        
        return "\n\n".join(context_parts)
    
    def generate_response(
        self,
        user_query: str,
        user_id: Optional[str] = None,
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """
        Generate AI response to user query using RAG
        
        Args:
            user_query: User's question or message
            user_id: Optional user identifier for personalization
            conversation_history: Optional previous conversation messages
        
        Returns:
            Dict with response, sources, and metadata
        """
        try:
            logger.info(f"💬 Processing query: '{user_query[:100]}...'")
            
            # Handle greetings directly
            greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening']
            if user_query.lower().strip() in greetings or any(g in user_query.lower() for g in greetings[:3]):
                return {
                    "response": "Hello! Welcome to IntelliHire HR Assistant. I'm here to help you with questions about company policies, procedures, benefits, onboarding, and other HR-related matters. How can I assist you today?",
                    "sources": [],
                    "retrieved_chunks": 0,
                    "has_context": False
                }
            
            # Retrieve relevant documents using RAG
            retrieved_docs = self.rag_service.search_documents(
                query=user_query,
                n_results=5  # Top 5 most relevant chunks
            )
            
            # Format context from retrieved documents
            document_context = self._format_context_from_documents(retrieved_docs)
            
            # Build conversation context if history provided
            conversation_context = ""
            if conversation_history and len(conversation_history) > 0:
                recent_history = conversation_history[-3:]  # Last 3 exchanges
                history_parts = []
                for msg in recent_history:
                    role = msg.get('role', 'user')
                    content = msg.get('content', '')
                    history_parts.append(f"{role.upper()}: {content}")
                conversation_context = f"\n\nRecent conversation:\n" + "\n".join(history_parts)
            
            # Construct prompt for Gemini
            prompt = f"""{self.system_prompt}

{conversation_context}

RETRIEVED COMPANY DOCUMENTS:
{document_context}

EMPLOYEE QUESTION:
{user_query}

INSTRUCTIONS:
- Base your answer primarily on the retrieved documents above
- If documents don't contain the answer, say so clearly
- Cite the document title when providing information
- Be helpful, professional, and concise
- For sensitive matters, suggest contacting HR directly

YOUR RESPONSE:"""
            
            # Generate response with DeepSeek API using OpenAI SDK
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1000,
                stream=False
            )
            
            ai_response = response.choices[0].message.content.strip()
            
            # Extract source documents (unique titles)
            sources = []
            seen_docs = set()
            for doc in retrieved_docs:
                metadata = doc.get('metadata', {})
                doc_id = metadata.get('document_id')
                if doc_id and doc_id not in seen_docs:
                    sources.append({
                        "title": metadata.get('title', 'Unknown'),
                        "category": metadata.get('category', 'general'),
                        "document_id": doc_id,
                        "relevance_score": doc.get('score', 0)
                    })
                    seen_docs.add(doc_id)
            
            logger.info(f"✅ Generated response with {len(sources)} source documents")
            
            return {
                "response": ai_response,
                "sources": sources,
                "retrieved_chunks": len(retrieved_docs),
                "has_context": len(retrieved_docs) > 0,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Error generating chatbot response: {e}")
            
            # Graceful fallback
            return {
                "response": "I apologize, but I'm experiencing technical difficulties. Please try again in a moment or contact HR directly for assistance.",
                "sources": [],
                "retrieved_chunks": 0,
                "has_context": False,
                "error": str(e)
            }
    
    def get_suggested_questions(self, category: Optional[str] = None) -> List[str]:
        """
        Get suggested questions for users to ask
        
        Args:
            category: Optional category to filter suggestions
        
        Returns:
            List of suggested question strings
        """
        all_suggestions = {
            "policies": [
                "What is the company leave policy?",
                "How do I request time off?",
                "What are the working hours?",
                "What is the remote work policy?"
            ],
            "benefits": [
                "What health insurance benefits are available?",
                "Do we have any employee wellness programs?",
                "What retirement benefits does the company offer?",
                "Are there professional development opportunities?"
            ],
            "onboarding": [
                "What documents do I need for onboarding?",
                "How do I set up my company email?",
                "What is the dress code?",
                "When do I receive my employee handbook?"
            ],
            "procedures": [
                "How do I report a workplace issue?",
                "What is the performance review process?",
                "How do I update my personal information?",
                "What is the expense reimbursement process?"
            ],
            "general": [
                "Who do I contact for IT support?",
                "What are the company holidays?",
                "How do I access the employee portal?",
                "What training resources are available?"
            ]
        }
        
        if category and category in all_suggestions:
            return all_suggestions[category]
        
        # Return mix from all categories
        suggestions = []
        for cat_questions in all_suggestions.values():
            suggestions.extend(cat_questions[:2])
        return suggestions[:8]
    
    def analyze_query_intent(self, query: str) -> Dict[str, Any]:
        """
        Analyze user query to determine intent and category
        
        Args:
            query: User's question
        
        Returns:
            Dict with intent analysis
        """
        query_lower = query.lower()
        
        # Category keywords
        categories = {
            "leave": ["leave", "vacation", "pto", "time off", "sick day", "holiday"],
            "benefits": ["benefit", "insurance", "health", "401k", "retirement", "wellness"],
            "onboarding": ["onboard", "start", "first day", "new employee", "join"],
            "payroll": ["salary", "pay", "paycheck", "compensation", "bonus"],
            "policy": ["policy", "rule", "procedure", "guideline", "regulation"],
            "equipment": ["laptop", "equipment", "hardware", "software", "tools"],
            "training": ["training", "course", "learning", "development", "skill"]
        }
        
        detected_categories = []
        for category, keywords in categories.items():
            if any(keyword in query_lower for keyword in keywords):
                detected_categories.append(category)
        
        # Determine if sensitive
        sensitive_keywords = ["salary", "pay", "compensation", "disciplinary", "termination", "complaint"]
        is_sensitive = any(keyword in query_lower for keyword in sensitive_keywords)
        
        return {
            "categories": detected_categories if detected_categories else ["general"],
            "is_sensitive": is_sensitive,
            "query_length": len(query.split()),
            "is_question": "?" in query
        }
