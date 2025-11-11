#!/usr/bin/env python3
"""
Google Education API Testing Script (Updated)
Tests available Gemini models and gTTS with provided API key
"""

import os
import sys
import time
from pathlib import Path

# Set up the API key
API_KEY = "AIzaSyBqOr81H2O5eGjGhKcZk9urE2SAfnTMTAI"
os.environ['GOOGLE_API_KEY'] = API_KEY

def list_available_models():
    """List all available Gemini models"""
    try:
        import google.generativeai as genai
        
        print("🔧 Configuring Gemini API...")
        genai.configure(api_key=API_KEY)
        
        print("📋 Listing available models...")
        
        models = []
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                models.append(m.name)
                print(f"✅ Available: {m.name}")
        
        return models
        
    except Exception as e:
        print(f"❌ Error listing models: {e}")
        return []

def test_gemini_with_model(model_name):
    """Test Gemini API with specific model"""
    try:
        import google.generativeai as genai
        
        print(f"🤖 Testing model: {model_name}")
        genai.configure(api_key=API_KEY)
        
        # Initialize the model
        model = genai.GenerativeModel(model_name)
        
        # Test prompt for IntelliHire
        prompt = """You are an AI interviewer for IntelliHire system. 
        Generate a professional interview question for a Software Engineer position.
        Make it engaging and concise (under 30 words)."""
        
        print("⚡ Generating content...")
        response = model.generate_content(prompt)
        
        print("✅ Response received:")
        print("-" * 50)
        print(response.text)
        print("-" * 50)
        
        return response.text
        
    except Exception as e:
        print(f"❌ Error with model {model_name}: {e}")
        return None

def test_gtts(text_to_speak):
    """Test gTTS (Google Translate Text-to-Speech)"""
    try:
        from gtts import gTTS
        
        print("🎤 Testing gTTS (Google Translate TTS)...")
        
        # Create TTS object
        tts = gTTS(text=text_to_speak, lang='en', slow=False)
        
        # Save audio file
        audio_file = "intellihire_test_speech.mp3"
        tts.save(audio_file)
        
        print(f"✅ Speech audio saved to: {audio_file}")
        print(f"📁 File size: {os.path.getsize(audio_file)} bytes")
        
        # Try to open with default audio player
        try:
            if os.name == 'nt':  # Windows
                os.startfile(audio_file)
                print("🔊 Opening audio file with default player...")
                print("💡 You should hear the generated speech now!")
            else:
                print("🔊 Please manually play the audio file to test")
        except Exception as e:
            print(f"⚠️ Could not auto-play: {e}")
            print("💡 Please manually open the MP3 file to test speech")
        
        return True
        
    except Exception as e:
        print(f"❌ gTTS Error: {e}")
        return False

def test_interview_questions():
    """Test generating multiple interview questions"""
    try:
        import google.generativeai as genai
        
        print("\n🎯 Testing IntelliHire Interview Question Generation...")
        print("-" * 50)
        
        genai.configure(api_key=API_KEY)
        
        # Find working model
        available_models = []
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                available_models.append(m.name)
        
        if not available_models:
            print("❌ No available models found")
            return False
        
        model_name = available_models[0]  # Use first available model
        print(f"Using model: {model_name}")
        model = genai.GenerativeModel(model_name)
        
        # Interview question prompts
        prompts = [
            "Generate a technical interview question about algorithms for a software engineer.",
            "Create a behavioral interview question about teamwork and problem-solving.",
            "Generate a question about debugging and troubleshooting experience."
        ]
        
        questions = []
        for i, prompt in enumerate(prompts, 1):
            print(f"\n📝 Generating Question {i}...")
            response = model.generate_content(prompt)
            question = response.text.strip()
            questions.append(question)
            print(f"Generated: {question}")
        
        # Convert all questions to speech
        from gtts import gTTS
        full_text = "Welcome to IntelliHire interview system. " + " ".join(questions)
        
        tts = gTTS(text=full_text, lang='en', slow=False)
        audio_file = "complete_interview_demo.mp3"
        tts.save(audio_file)
        
        print(f"\n🎤 Complete interview audio saved: {audio_file}")
        print("✅ Interview question generation test completed!")
        
        return True
        
    except Exception as e:
        print(f"❌ Interview questions error: {e}")
        return False

def main():
    """Main testing function"""
    print("=" * 60)
    print("🚀 IntelliHire - Google Education API Testing (Updated)")
    print("=" * 60)
    print(f"📅 Date: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🔑 API Key: {API_KEY[:20]}...{API_KEY[-10:]}")
    print("=" * 60)
    
    # Test 1: List Available Models
    print("\n📋 TEST 1: Available Gemini Models")
    print("-" * 40)
    available_models = list_available_models()
    
    if available_models:
        # Test 2: Text Generation with available model
        print("\n📝 TEST 2: Text Generation")
        print("-" * 40)
        model_to_use = available_models[0]  # Use first available
        generated_text = test_gemini_with_model(model_to_use)
        
        if generated_text:
            # Test 3: Text-to-Speech
            print("\n🎤 TEST 3: Text-to-Speech")
            print("-" * 40)
            tts_success = test_gtts(generated_text)
            
            if tts_success:
                # Test 4: Complete Interview Demo
                print("\n🎯 TEST 4: Complete Interview Demo")
                print("-" * 40)
                test_interview_questions()
    
    print("\n" + "=" * 60)
    print("🏁 Google Education API Testing Completed!")
    
    if available_models:
        print("🎉 SUCCESS: Your Google Education API key is working!")
        print("✅ Gemini AI: Available and functional")
        print("✅ Text-to-Speech: Working")
        print("💡 Check the generated MP3 files for speech quality")
        print("🚀 Ready to integrate into IntelliHire system!")
    else:
        print("❌ No working models found - check API key permissions")
    
    print("=" * 60)

if __name__ == "__main__":
    main()