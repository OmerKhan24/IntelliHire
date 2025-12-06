import os
import asyncio
from concurrent.futures import ThreadPoolExecutor
from gtts import gTTS
import tempfile


class GeminiService:
    """
    Google services for Text-to-Speech (TTS) only.
    Question generation and scoring now handled by GitHub Copilot API.
    """
    
    def __init__(self):
        self.executor = ThreadPoolExecutor(max_workers=3)
        # TTS is always enabled (uses gTTS, no API key needed)
        self.enabled = True
        print("✅ Google TTS service enabled")
    
    async def text_to_speech(self, text, lang='en'):
        """
        Convert text to speech using Google Text-to-Speech (gTTS)
        
        Args:
            text: Text to convert to speech
            lang: Language code (default: 'en')
        
        Returns:
            str: Path to generated audio file, or None on error
        """
        try:
            loop = asyncio.get_event_loop()
            
            def _generate_tts():
                tts = gTTS(text=text, lang=lang, slow=False)
                temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
                tts.save(temp_file.name)
                return temp_file.name
            
            audio_path = await loop.run_in_executor(self.executor, _generate_tts)
            print(f"✅ Generated TTS audio: {audio_path}")
            return audio_path
        except Exception as e:
            print(f"❌ Error in text-to-speech: {e}")
            return None


gemini_service = GeminiService()
