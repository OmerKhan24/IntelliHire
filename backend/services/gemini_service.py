import os
import asyncio
from concurrent.futures import ThreadPoolExecutor
import tempfile
from elevenlabs.client import ElevenLabs


class GeminiService:
    """
    Text-to-Speech service using ElevenLabs.
    Question generation and scoring handled by GitHub Copilot API.
    """

    def __init__(self):
        self.executor = ThreadPoolExecutor(max_workers=3)
        api_key = os.environ.get('ELEVENLABS_API_KEY')
        self.voice_id = os.environ.get('ELEVENLABS_VOICE_ID', 'UgBBYS2sOqTuMpoF3BR0')
        if not api_key:
            raise ValueError("ELEVENLABS_API_KEY is not set")
        self.client = ElevenLabs(api_key=api_key)
        self.enabled = True
        print("✅ ElevenLabs TTS service enabled")

    async def text_to_speech(self, text, lang='en'):
        """
        Convert text to speech using ElevenLabs.

        Returns:
            str: Path to generated MP3 file, or None on error
        """
        try:
            loop = asyncio.get_event_loop()

            def _generate_tts():
                audio_generator = self.client.text_to_speech.convert(
                    voice_id=self.voice_id,
                    text=text,
                    model_id="eleven_turbo_v2_5",
                    output_format="mp3_44100_128",
                )
                audio_bytes = b"".join(audio_generator)
                temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
                temp_file.write(audio_bytes)
                temp_file.close()
                return temp_file.name

            audio_path = await loop.run_in_executor(self.executor, _generate_tts)
            print(f"✅ Generated ElevenLabs TTS audio: {audio_path}")
            return audio_path
        except Exception as e:
            print(f"❌ Error in ElevenLabs text-to-speech: {e}")
            return None

    def text_to_speech_bytes(self, text):
        """
        Synchronous version — returns raw MP3 bytes for streaming to frontend.
        """
        audio_generator = self.client.text_to_speech.convert(
            voice_id=self.voice_id,
            text=text,
            model_id="eleven_turbo_v2_5",
            output_format="mp3_44100_128",
        )
        return b"".join(audio_generator)


gemini_service = GeminiService()
