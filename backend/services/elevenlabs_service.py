"""
ElevenLabs Text-to-Speech Service
Uses the official ElevenLabs Python SDK.
Falls back to gTTS if the API key is not configured.
"""
import os
import logging
import tempfile
from gtts import gTTS

logger = logging.getLogger(__name__)

# Voice chosen by the team — configure via env to override
DEFAULT_VOICE_ID = os.environ.get("ELEVENLABS_VOICE_ID", "UgBBYS2sOqTuMpoF3BR0")
DEFAULT_MODEL_ID = os.environ.get("ELEVENLABS_MODEL_ID", "eleven_multilingual_v2")


class ElevenLabsService:
    """
    Wraps the official ElevenLabs Python SDK for TTS.
    Falls back to gTTS automatically when ELEVENLABS_API_KEY is not set.
    """

    def __init__(self):
        self.api_key = os.environ.get("ELEVENLABS_API_KEY")
        self.voice_id = DEFAULT_VOICE_ID
        self.model_id = DEFAULT_MODEL_ID
        self._client = None

        if self.api_key:
            try:
                from elevenlabs.client import ElevenLabs
                self._client = ElevenLabs(api_key=self.api_key)
                logger.info("✅ ElevenLabs SDK ready (voice_id=%s)", self.voice_id)
            except ImportError:
                logger.warning("⚠️  elevenlabs package not installed — pip install elevenlabs")
        else:
            logger.warning(
                "⚠️  ELEVENLABS_API_KEY not set — TTS will fall back to gTTS"
            )

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def text_to_speech(self, text: str) -> str:
        """
        Convert *text* to speech.
        Returns the absolute path of a temporary .mp3 file.
        """
        if self._client:
            return self._elevenlabs_tts(text)
        return self._gtts_fallback(text)

    def text_to_speech_stream(self, text: str):
        """
        Generator — yields raw audio bytes chunks (audio/mpeg).
        Falls back to gTTS bytes if SDK is unavailable.
        """
        if not self._client:
            path = self._gtts_fallback(text)
            with open(path, "rb") as f:
                yield f.read()
            os.unlink(path)
            return

        try:
            from elevenlabs import VoiceSettings
            audio_stream = self._client.text_to_speech.convert(
                voice_id=self.voice_id,
                text=text,
                model_id=self.model_id,
                voice_settings=VoiceSettings(
                    stability=0.5,
                    similarity_boost=0.75,
                    style=0.0,
                    use_speaker_boost=True,
                ),
                output_format="mp3_44100_128",
            )
            for chunk in audio_stream:
                if chunk:
                    yield chunk
        except Exception as exc:
            logger.error("❌ ElevenLabs stream failed: %s — falling back to gTTS", exc)
            path = self._gtts_fallback(text)
            with open(path, "rb") as f:
                yield f.read()
            os.unlink(path)

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _elevenlabs_tts(self, text: str) -> str:
        """Call ElevenLabs SDK and save result to a temp mp3 file."""
        try:
            from elevenlabs import VoiceSettings
            audio_stream = self._client.text_to_speech.convert(
                voice_id=self.voice_id,
                text=text,
                model_id=self.model_id,
                voice_settings=VoiceSettings(
                    stability=0.5,
                    similarity_boost=0.75,
                    style=0.0,
                    use_speaker_boost=True,
                ),
                output_format="mp3_44100_128",
            )
            tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
            for chunk in audio_stream:
                if chunk:
                    tmp.write(chunk)
            tmp.flush()
            tmp.close()
            logger.info("✅ ElevenLabs TTS generated: %s", tmp.name)
            return tmp.name
        except Exception as exc:
            logger.error("❌ ElevenLabs TTS failed: %s — falling back to gTTS", exc)
            return self._gtts_fallback(text)

    def _gtts_fallback(self, text: str) -> str:
        """Generate speech with gTTS as a fallback."""
        try:
            tts = gTTS(text=text, lang="en", slow=False)
            tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
            tts.save(tmp.name)
            logger.info("✅ gTTS fallback generated: %s", tmp.name)
            return tmp.name
        except Exception as exc:
            raise RuntimeError(f"gTTS fallback failed: {exc}") from exc


# Singleton — imported by routes
elevenlabs_service = ElevenLabsService()
