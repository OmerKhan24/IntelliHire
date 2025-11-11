#!/usr/bin/env python3
"""
Google Education API Testing Script
Tests Gemini Pro API and Google Cloud TTS with provided API key
"""

import os
import sys
import json
import time
import tempfile
import pygame
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
        
        # Test prompt
        prompt = """You are an AI interviewer for IntelliHire system. 
        Generate a professional interview question for a Software Engineer position.
        Keep it concise and professional."""
        
        print("🤖 Testing Gemini Pro text generation...")
        response = model.generate_content(prompt)
        
        print("✅ Gemini Pro Response:")
        print("-" * 50)
        print(response.text)
        print("-" * 50)
        
        return response.text
        
    except ImportError:
        print("❌ Error: google-generativeai package not installed")
        print("💡 Install with: pip install google-generativeai")
        return None
    except Exception as e:
        print(f"❌ Gemini Pro Error: {e}")
        return None

def test_google_tts(text_to_speak):
    """Test Google Cloud Text-to-Speech"""
    try:
        from google.cloud import texttospeech
        
        print("🔧 Configuring Google Cloud TTS...")
        
        # Set up credentials using the API key
        # Note: For production, use service account JSON file
        os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = create_temp_credentials()
        
        # Initialize the TTS client
        client = texttospeech.TextToSpeechClient()
        
        # Set the text input
        synthesis_input = texttospeech.SynthesisInput(text=text_to_speak)
        
        # Build the voice request
        voice = texttospeech.VoiceSelectionParams(
            language_code="en-US",
            name="en-US-Wavenet-F",  # Female voice
            ssml_gender=texttospeech.SsmlVoiceGender.FEMALE
        )
        
        # Select the audio file type
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3
        )
        
        print("🎤 Generating speech with Google TTS...")
        response = client.synthesize_speech(
            input=synthesis_input, 
            voice=voice, 
            audio_config=audio_config
        )
        
        # Save the audio file
        audio_file = "test_tts_output.mp3"
        with open(audio_file, "wb") as out:
            out.write(response.audio_content)
        
        print(f"✅ Audio content saved to: {audio_file}")
        
        # Try to play the audio
        play_audio(audio_file)
        
        return True
        
    except ImportError as e:
        print("❌ Error: Google Cloud TTS package not installed")
        print("💡 Install with: pip install google-cloud-texttospeech")
        return False
    except Exception as e:
        print(f"❌ Google TTS Error: {e}")
        print("💡 Note: TTS might require service account credentials instead of API key")
        return False

def create_temp_credentials():
    """Create temporary credentials file (for testing only)"""
    try:
        # This is a simplified approach - in production use proper service account
        temp_creds = {
            "type": "service_account",
            "project_id": "your-project-id",
            "private_key_id": "dummy",
            "private_key": "dummy",
            "client_email": "dummy@your-project.iam.gserviceaccount.com",
            "client_id": "dummy",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token"
        }
        
        temp_file = tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False)
        json.dump(temp_creds, temp_file)
        temp_file.flush()
        
        return temp_file.name
    except Exception as e:
        print(f"❌ Could not create temp credentials: {e}")
        return None

def play_audio(audio_file):
    """Play audio file using pygame"""
    try:
        pygame.mixer.init()
        pygame.mixer.music.load(audio_file)
        
        print("🔊 Playing audio...")
        pygame.mixer.music.play()
        
        # Wait for playback to finish
        while pygame.mixer.music.get_busy():
            time.sleep(0.1)
        
        print("✅ Audio playback completed!")
        
    except ImportError:
        print("❌ pygame not installed - cannot play audio")
        print("💡 Install with: pip install pygame")
        print(f"📁 Audio file saved as: {audio_file}")
    except Exception as e:
        print(f"❌ Audio playback error: {e}")
        print(f"📁 Audio file saved as: {audio_file}")

def test_alternative_tts(text_to_speak):
    """Test alternative TTS using gTTS (Google Translate TTS)"""
    try:
        from gtts import gTTS
        
        print("🎤 Testing gTTS (Google Translate TTS)...")
        
        # Create TTS object
        tts = gTTS(text=text_to_speak, lang='en', slow=False)
        
        # Save audio file
        audio_file = "test_gtts_output.mp3"
        tts.save(audio_file)
        
        print(f"✅ gTTS audio saved to: {audio_file}")
        
        # Try to play the audio
        play_audio(audio_file)
        
        return True
        
    except ImportError:
        print("❌ gTTS not installed")
        print("💡 Install with: pip install gTTS")
        return False
    except Exception as e:
        print(f"❌ gTTS Error: {e}")
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
        # Test 2: Google Cloud TTS
        print("\n🎤 TEST 2: Google Cloud TTS")
        print("-" * 40)
        tts_success = test_google_tts(generated_text)
        
        if not tts_success:
            # Test 3: Alternative TTS (gTTS)
            print("\n🎤 TEST 3: Alternative TTS (gTTS)")
            print("-" * 40)
            test_alternative_tts(generated_text)
    
    print("\n" + "=" * 60)
    print("🏁 Testing completed!")
    print("💡 If TTS failed, you might need to set up Google Cloud credentials")
    print("📚 For production: Use service account JSON file instead of API key")
    print("=" * 60)

if __name__ == "__main__":
    main()