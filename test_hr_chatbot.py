"""
Test script for HR Chatbot module
Run this after completing setup to verify everything works
"""

import requests
import json
import os

# Configuration
BASE_URL = "http://localhost:5000/api"
JWT_TOKEN = None  # Will be obtained from login

# Colors for output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_success(message):
    print(f"{Colors.GREEN}✅ {message}{Colors.END}")

def print_error(message):
    print(f"{Colors.RED}❌ {message}{Colors.END}")

def print_info(message):
    print(f"{Colors.BLUE}ℹ️  {message}{Colors.END}")

def print_warning(message):
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.END}")

def login_as_admin():
    """Login and get JWT token"""
    global JWT_TOKEN
    print_info("Logging in as admin...")
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={
                "username": "admin",
                "password": "admin123"
            }
        )
        
        if response.status_code == 200:
            JWT_TOKEN = response.json()['access_token']
            print_success("Login successful")
            return True
        else:
            print_error(f"Login failed: {response.json()}")
            return False
    except Exception as e:
        print_error(f"Login error: {str(e)}")
        return False

def create_test_document():
    """Create a test policy document"""
    print_info("Creating test document...")
    
    content = """
IntelliHire Company Leave Policy

1. Vacation Days
- Full-time employees: 15 vacation days per year
- Part-time employees: Prorated based on hours
- Accrual: 1.25 days per month

2. Sick Leave
- All employees: 10 sick days per year
- No doctor's note required for 1-2 days
- Doctor's note required for 3+ consecutive days

3. Holidays
- 10 paid holidays per year
- Federal holidays observed
- See company calendar for specific dates

4. Remote Work
- Hybrid model: 3 days in office, 2 days remote
- Full remote available with manager approval
- Core hours: 10 AM - 3 PM

5. Time Off Requests
- Submit via employee portal at least 2 weeks in advance
- Manager approval required
- Emergency time off: Contact manager immediately
"""
    
    filename = "test_company_policy.txt"
    with open(filename, 'w') as f:
        f.write(content)
    
    print_success(f"Test document created: {filename}")
    return filename

def test_document_upload():
    """Test document upload endpoint"""
    print_info("Testing document upload...")
    
    filename = create_test_document()
    
    try:
        with open(filename, 'rb') as f:
            files = {'file': (filename, f, 'text/plain')}
            data = {
                'title': 'IntelliHire Leave Policy',
                'description': 'Complete leave and remote work policy',
                'category': 'policy',
                'tags': 'leave,vacation,sick,remote'
            }
            
            response = requests.post(
                f"{BASE_URL}/hr/documents/upload",
                headers={'Authorization': f'Bearer {JWT_TOKEN}'},
                files=files,
                data=data
            )
        
        if response.status_code == 201:
            result = response.json()
            print_success("Document uploaded successfully")
            print_info(f"Document ID: {result['document']['document_id']}")
            print_info(f"Chunks created: {result['processing_info']['chunks_created']}")
            return result['document']['id']
        else:
            print_error(f"Upload failed: {response.json()}")
            return None
            
    except Exception as e:
        print_error(f"Upload error: {str(e)}")
        return None
    finally:
        # Clean up test file
        if os.path.exists(filename):
            os.remove(filename)

def test_list_documents():
    """Test listing documents"""
    print_info("Testing document list...")
    
    try:
        response = requests.get(
            f"{BASE_URL}/hr/documents",
            headers={'Authorization': f'Bearer {JWT_TOKEN}'}
        )
        
        if response.status_code == 200:
            result = response.json()
            print_success(f"Found {result['total']} documents")
            
            if result['documents']:
                doc = result['documents'][0]
                print_info(f"Latest: {doc['title']} ({doc['category']})")
            return True
        else:
            print_error(f"List failed: {response.json()}")
            return False
            
    except Exception as e:
        print_error(f"List error: {str(e)}")
        return False

def test_chatbot_query(query):
    """Test chatbot with a query"""
    print_info(f"Testing chatbot query: '{query}'")
    
    try:
        response = requests.post(
            f"{BASE_URL}/hr/chat/message",
            headers={
                'Authorization': f'Bearer {JWT_TOKEN}',
                'Content-Type': 'application/json'
            },
            json={'message': query}
        )
        
        if response.status_code == 200:
            result = response.json()
            print_success("Chatbot response received")
            print_info(f"Response: {result['message']['content'][:200]}...")
            print_info(f"Sources used: {len(result['message']['sources'])}")
            print_info(f"Has context: {result['message']['has_context']}")
            return result['session_id']
        else:
            print_error(f"Chat failed: {response.json()}")
            return None
            
    except Exception as e:
        print_error(f"Chat error: {str(e)}")
        return None

def test_conversation_history(session_id):
    """Test getting conversation history"""
    print_info("Testing conversation history...")
    
    try:
        response = requests.get(
            f"{BASE_URL}/hr/chat/conversations",
            headers={'Authorization': f'Bearer {JWT_TOKEN}'}
        )
        
        if response.status_code == 200:
            result = response.json()
            print_success(f"Found {result['total']} conversations")
            return True
        else:
            print_error(f"History failed: {response.json()}")
            return False
            
    except Exception as e:
        print_error(f"History error: {str(e)}")
        return False

def test_suggested_questions():
    """Test getting suggested questions"""
    print_info("Testing suggested questions...")
    
    try:
        response = requests.get(
            f"{BASE_URL}/hr/chat/suggestions?category=benefits",
            headers={'Authorization': f'Bearer {JWT_TOKEN}'}
        )
        
        if response.status_code == 200:
            result = response.json()
            print_success(f"Got {len(result['suggestions'])} suggestions")
            print_info(f"Examples: {result['suggestions'][:2]}")
            return True
        else:
            print_error(f"Suggestions failed: {response.json()}")
            return False
            
    except Exception as e:
        print_error(f"Suggestions error: {str(e)}")
        return False

def test_document_stats():
    """Test getting document statistics"""
    print_info("Testing document statistics...")
    
    try:
        response = requests.get(
            f"{BASE_URL}/hr/documents/stats",
            headers={'Authorization': f'Bearer {JWT_TOKEN}'}
        )
        
        if response.status_code == 200:
            result = response.json()
            print_success("Stats retrieved")
            print_info(f"Database docs: {result['database']['total_documents']}")
            print_info(f"Vector store chunks: {result['vector_store']['total_chunks']}")
            return True
        else:
            print_error(f"Stats failed: {response.json()}")
            return False
            
    except Exception as e:
        print_error(f"Stats error: {str(e)}")
        return False

def run_all_tests():
    """Run complete test suite"""
    print("\n" + "="*60)
    print("🧪 HR Chatbot Module - Test Suite")
    print("="*60 + "\n")
    
    # Test 1: Login
    if not login_as_admin():
        print_error("Cannot proceed without login")
        return
    
    print()
    
    # Test 2: Document Upload
    doc_id = test_document_upload()
    print()
    
    # Test 3: List Documents
    test_list_documents()
    print()
    
    # Test 4: Chatbot Queries
    queries = [
        "How many vacation days do employees get?",
        "What is the remote work policy?",
        "How do I request time off?"
    ]
    
    session_id = None
    for query in queries:
        session_id = test_chatbot_query(query)
        print()
    
    # Test 5: Conversation History
    if session_id:
        test_conversation_history(session_id)
        print()
    
    # Test 6: Suggested Questions
    test_suggested_questions()
    print()
    
    # Test 7: Document Stats
    test_document_stats()
    print()
    
    print("="*60)
    print("🎉 Test suite completed!")
    print("="*60)
    print("\nNext steps:")
    print("1. Check logs for any warnings")
    print("2. Try uploading real company documents")
    print("3. Test with different user roles")
    print("4. Build the frontend interface")

if __name__ == "__main__":
    try:
        run_all_tests()
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
    except Exception as e:
        print_error(f"Test suite failed: {str(e)}")
