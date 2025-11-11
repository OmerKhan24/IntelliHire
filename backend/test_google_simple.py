#!/usr/bin/env python3
"""
Google Education API Testing Script (Simplified)
Tests Gemini Pro API and gTTS with provided API key
"""

import os
import sys
import time
import webbrowser
from pathlib import Path

# Set up the API key
API_KEY = "AIzaSyBqOr81H2O5eGjGhKcZk9urE2SAfnTMTAI"
os.environ['GOOGLE_API_KEY'] = API_KEY

def test_gemini_pro():
    """Test Gemini Pro API for text generation"""
    try:
        import google.generativeai as genai
        
        print("🔧 Configuring Gemini Pro API...")
        genai.configure(api_key=API_KEY)
        
        # Initialize the model
        model = genai.GenerativeModel('gemini-pro')
        
        # Test prompt for IntelliHire
        prompt = """You are an AI interviewer for IntelliHire system. 
        Generate a professional interview question for a Software Engineer position focusing on problem-solving skills.
        Make it engaging and suitable for an automated interview system.
        Keep response under 50 words."""
        
        print("🤖 Testing Gemini Pro text generation...")
        response = model.generate_content(prompt)
        
        print("✅ Gemini Pro Response:")
        print("-" * 50)
        print(response.text)
        print("-" * 50)
        
        return response.text
        
    except ImportError:
        print("❌ Error: google-generativeai package not installed")
        return None
    except Exception as e:
        print(f"❌ Gemini Pro Error: {e}")
        return None

def test_gtts(text_to_speak):
    """Test gTTS (Google Translate Text-to-Speech)"""
    try:
        from gtts import gTTS
        
        print("🎤 Testing gTTS (Google Translate TTS)...")
        
        # Create TTS object
        tts = gTTS(text=text_to_speak, lang='en', slow=False)
        
        # Save audio file
        audio_file = "test_speech_output.mp3"
        tts.save(audio_file)
        
        print(f"✅ Speech audio saved to: {audio_file}")
        print(f"📁 File size: {os.path.getsize(audio_file)} bytes")
        
        # Try to open with default audio player
        try:
            if os.name == 'nt':  # Windows
                os.startfile(audio_file)
                print("🔊 Opening audio file with default player...")
            else:
                print("🔊 Please manually play the audio file to test")
        except Exception as e:
            print(f"⚠️ Could not auto-play: {e}")
            print("💡 Please manually open the MP3 file to test speech")
        
        return True
        
    except ImportError:
        print("❌ gTTS not installed")
        return False
    except Exception as e:
        print(f"❌ gTTS Error: {e}")
        return False

def test_interview_conversation():
    """Test a complete interview conversation flow"""
    try:
        import google.generativeai as genai
        from gtts import gTTS
        
        print("\n🎯 Testing Complete Interview Flow...")
        print("-" * 50)
        
        genai.configure(api_key=API_KEY)
        model = genai.GenerativeModel('gemini-pro')
        
        # Simulate interview questions
        questions = [
            "Generate a brief welcome message for IntelliHire interview system",
            "Create a technical question about data structures for a software engineer",
            "Generate a follow-up question about teamwork and collaboration"
        ]
        
        for i, prompt in enumerate(questions, 1):
            print(f"\n📝 Question {i}:")
            response = model.generate_content(prompt)
            question_text = response.text
            print(f"Generated: {question_text}")
            
            # Convert to speech
            tts = gTTS(text=question_text, lang='en', slow=False)
            audio_file = f"interview_question_{i}.mp3"
            tts.save(audio_file)
            print(f"🎤 Audio saved: {audio_file}")
        
        print("\n✅ Interview conversation flow test completed!")
        return True
        
    except Exception as e:
        print(f"❌ Interview flow error: {e}")
        return False

def test_api_limits():
    """Test API rate limits and responses"""
    try:
        import google.generativeai as genai
        
        print("\n⚡ Testing API Rate Limits...")
        genai.configure(api_key=API_KEY)
        model = genai.GenerativeModel('gemini-pro')
        
        # Test multiple rapid requests
        for i in range(3):
            prompt = f"Generate interview question #{i+1} for a Python developer position"
            start_time = time.time()
            response = model.generate_content(prompt)
            end_time = time.time()
            
            print(f"Request {i+1}: {end_time - start_time:.2f}s - {len(response.text)} chars")
        
        print("✅ API rate limit test completed")
        return True
        
    except Exception as e:
        print(f"❌ Rate limit test error: {e}")
        return False

def main():
    """Main testing function"""
    print("=" * 60)
    print("🚀 IntelliHire - Google Education API Testing")
    print("=" * 60)
    print(f"📅 Date: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🔑 API Key: {API_KEY[:20]}...{API_KEY[-10:]}")
    print("=" * 60)
    
    # Test 1: Gemini Pro Text Generation
    print("\n📝 TEST 1: Gemini Pro Text Generation")
    print("-" * 40)
    generated_text = test_gemini_pro()
    
    if generated_text:
        # Test 2: Text-to-Speech
        print("\n🎤 TEST 2: Text-to-Speech (gTTS)")
        print("-" * 40)
        tts_success = test_gtts(generated_text)
        
        if tts_success:
            # Test 3: Complete Interview Flow
            print("\n🎯 TEST 3: Complete Interview Flow")
            print("-" * 40)
            test_interview_conversation()
            
            # Test 4: API Performance
            print("\n⚡ TEST 4: API Performance")
            print("-" * 40)
            test_api_limits()
    
    print("\n" + "=" * 60)
    print("🏁 Google Education API Testing Completed!")
    print("💡 Check the generated MP3 files for speech quality")
    print("🎉 Your API key is working if you see text generation above!")
    print("=" * 60)

if __name__ == "__main__":
    main()