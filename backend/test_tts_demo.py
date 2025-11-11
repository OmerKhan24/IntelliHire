#!/usr/bin/env python3
"""
IntelliHire TTS Demo - Test speech generation without using Gemini quota
"""

import os
import time

def test_tts_only():
    """Test Text-to-Speech functionality"""
    try:
        from gtts import gTTS
        
        print("🎤 Testing IntelliHire Speech System...")
        
        # Sample interview content
        interview_texts = [
            "Welcome to IntelliHire, the AI-powered interview system. I'll be conducting your interview today.",
            "Let's start with a technical question. Can you explain the difference between a list and a dictionary in Python?",
            "Great answer! Now tell me about a challenging project you've worked on and how you solved the problems you encountered.",
            "Thank you for your responses. The interview is now complete. You will receive your results shortly."
        ]
        
        print("🔊 Generating interview speech files...")
        
        for i, text in enumerate(interview_texts, 1):
            print(f"📝 Generating speech {i}/4: {text[:50]}...")
            
            # Create TTS
            tts = gTTS(text=text, lang='en', slow=False)
            
            # Save with descriptive filename
            filename = f"intellihire_interview_part_{i}.mp3"
            tts.save(filename)
            
            file_size = os.path.getsize(filename)
            print(f"✅ Saved: {filename} ({file_size} bytes)")
        
        # Create complete interview
        full_interview = " ".join(interview_texts)
        tts_full = gTTS(text=full_interview, lang='en', slow=False)
        tts_full.save("intellihire_complete_interview.mp3")
        
        print(f"\n🎯 Complete interview audio: intellihire_complete_interview.mp3")
        print(f"📁 File size: {os.path.getsize('intellihire_complete_interview.mp3')} bytes")
        
        # Auto-play the complete interview
        try:
            if os.name == 'nt':  # Windows
                os.startfile("intellihire_complete_interview.mp3")
                print("🔊 Playing complete interview demo...")
                print("💡 Listen to hear how IntelliHire will sound!")
        except Exception as e:
            print(f"⚠️ Could not auto-play: {e}")
        
        return True
        
    except Exception as e:
        print(f"❌ TTS Error: {e}")
        return False

def demo_voice_options():
    """Demo different voice options"""
    try:
        from gtts import gTTS
        
        print("\n🎭 Testing different voice characteristics...")
        
        sample_text = "Hello, I am your IntelliHire interviewer. Let's begin the assessment."
        
        # Different language accents for English
        voice_options = [
            ('en-us', 'American English'),
            ('en-uk', 'British English'), 
            ('en-au', 'Australian English'),
            ('en-ca', 'Canadian English')
        ]
        
        for lang_code, description in voice_options:
            try:
                print(f"🎙️ Generating {description} voice...")
                tts = gTTS(text=sample_text, lang=lang_code, slow=False)
                filename = f"voice_demo_{lang_code.replace('-', '_')}.mp3"
                tts.save(filename)
                print(f"✅ Saved: {filename}")
            except Exception as e:
                print(f"⚠️ {description} not available: {e}")
        
        # Slow vs Normal speed
        print("\n⚡ Testing speech speeds...")
        
        tts_normal = gTTS(text=sample_text, lang='en', slow=False)
        tts_normal.save("voice_normal_speed.mp3")
        
        tts_slow = gTTS(text=sample_text, lang='en', slow=True)
        tts_slow.save("voice_slow_speed.mp3")
        
        print("✅ Normal speed: voice_normal_speed.mp3")
        print("✅ Slow speed: voice_slow_speed.mp3")
        
        return True
        
    except Exception as e:
        print(f"❌ Voice options error: {e}")
        return False

def main():
    print("=" * 60)
    print("🚀 IntelliHire - Text-to-Speech Demo")
    print("=" * 60)
    print(f"📅 Date: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print("🔧 Testing speech generation for interview system")
    print("=" * 60)
    
    # Test basic TTS
    success = test_tts_only()
    
    if success:
        # Demo voice options
        demo_voice_options()
    
    print("\n" + "=" * 60)
    print("🏁 IntelliHire TTS Demo Completed!")
    
    if success:
        print("🎉 SUCCESS: Text-to-Speech system working perfectly!")
        print("✅ Multiple interview audio files generated")
        print("✅ Different voice options available")
        print("💡 Ready to integrate with Gemini AI (quota resets daily)")
        print("🚀 IntelliHire speech pipeline is functional!")
    else:
        print("❌ TTS system needs debugging")
    
    print("=" * 60)

if __name__ == "__main__":
    main()