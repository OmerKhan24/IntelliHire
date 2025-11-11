"""
Speech-to-Text Module using OpenAI Whisper
Modular component for converting audio to text during interviews
"""
import whisper
import torch
import numpy as np
import logging
from typing import Optional, Dict, Any
from pathlib import Path

logger = logging.getLogger(__name__)

class SpeechToTextProcessor:
    """Modular Speech-to-Text processor using Whisper"""
    
    def __init__(self, model_size: str = "base"):
        """
        Initialize Whisper model
        
        Args:
            model_size: Whisper model size (tiny, base, small, medium, large)
        """
        self.model_size = model_size
        self.model = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Speech-to-Text initialized with device: {self.device}")
        
    def load_model(self) -> bool:
        """Load Whisper model"""
        try:
            logger.info(f"Loading Whisper model: {self.model_size}")
            self.model = whisper.load_model(self.model_size, device=self.device)
            logger.info("Whisper model loaded successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to load Whisper model: {e}")
            return False
    
    def transcribe_audio(self, audio_path: str, language: str = "en") -> Dict[str, Any]:
        """
        Transcribe audio file to text
        
        Args:
            audio_path: Path to audio file
            language: Language code (en, ur, etc.)
            
        Returns:
            Dict with transcription results
        """
        if not self.model:
            if not self.load_model():
                return {"error": "Failed to load model"}
        
        try:
            audio_file = Path(audio_path)
            if not audio_file.exists():
                return {"error": f"Audio file not found: {audio_path}"}
            
            logger.info(f"Transcribing audio: {audio_path}")
            
            # Transcribe with Whisper
            result = self.model.transcribe(
                str(audio_file),
                language=language,
                task="transcribe",
                verbose=False
            )
            
            # Extract key information
            transcription_result = {
                "text": result["text"].strip(),
                "language": result["language"],
                "segments": [
                    {
                        "start": seg["start"],
                        "end": seg["end"],
                        "text": seg["text"].strip(),
                        "confidence": seg.get("avg_logprob", 0.0)
                    }
                    for seg in result["segments"]
                ],
                "duration": result["segments"][-1]["end"] if result["segments"] else 0,
                "word_count": len(result["text"].split()),
                "speaking_rate": len(result["text"].split()) / (result["segments"][-1]["end"] if result["segments"] else 1)
            }
            
            logger.info(f"Transcription completed: {len(transcription_result['text'])} characters")
            return transcription_result
            
        except Exception as e:
            logger.error(f"Transcription failed: {e}")
            return {"error": str(e)}
    
    def analyze_speech_patterns(self, transcription_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze speech patterns from transcription
        
        Args:
            transcription_result: Result from transcribe_audio
            
        Returns:
            Speech analysis metrics
        """
        try:
            text = transcription_result.get("text", "")
            segments = transcription_result.get("segments", [])
            
            if not text or not segments:
                return {"error": "Invalid transcription data"}
            
            # Calculate speech metrics
            total_duration = transcription_result.get("duration", 0)
            word_count = transcription_result.get("word_count", 0)
            
            # Pause analysis
            pauses = []
            for i in range(1, len(segments)):
                pause_duration = segments[i]["start"] - segments[i-1]["end"]
                if pause_duration > 0.5:  # Significant pause
                    pauses.append(pause_duration)
            
            # Confidence analysis
            confidences = [seg["confidence"] for seg in segments]
            avg_confidence = np.mean(confidences) if confidences else 0
            
            analysis = {
                "speech_rate_wpm": (word_count / total_duration * 60) if total_duration > 0 else 0,
                "total_duration": total_duration,
                "word_count": word_count,
                "pause_count": len(pauses),
                "avg_pause_duration": np.mean(pauses) if pauses else 0,
                "max_pause_duration": max(pauses) if pauses else 0,
                "avg_confidence": avg_confidence,
                "confidence_variance": np.var(confidences) if confidences else 0,
                "fluency_score": self._calculate_fluency_score(transcription_result),
                "clarity_indicators": {
                    "filler_words": self._count_filler_words(text),
                    "repetitions": self._count_repetitions(segments),
                    "incomplete_sentences": self._count_incomplete_sentences(text)
                }
            }
            
            return analysis
            
        except Exception as e:
            logger.error(f"Speech analysis failed: {e}")
            return {"error": str(e)}
    
    def _calculate_fluency_score(self, transcription_result: Dict[str, Any]) -> float:
        """Calculate fluency score based on various factors"""
        try:
            segments = transcription_result.get("segments", [])
            if not segments:
                return 0.0
            
            # Factors: confidence, pause frequency, speech rate
            confidences = [seg["confidence"] for seg in segments]
            avg_confidence = np.mean(confidences) if confidences else 0
            
            # Normalize speech rate (optimal around 150-160 WPM)
            speech_rate = transcription_result.get("speaking_rate", 0) * 60  # Convert to WPM
            rate_score = 1.0 - abs(speech_rate - 155) / 100  # Penalize deviation from 155 WPM
            rate_score = max(0, min(1, rate_score))
            
            # Combine factors
            fluency_score = (avg_confidence * 0.4 + rate_score * 0.6)
            return max(0, min(1, fluency_score))
            
        except Exception:
            return 0.0
    
    def _count_filler_words(self, text: str) -> int:
        """Count filler words in transcription"""
        filler_words = ["um", "uh", "like", "you know", "actually", "basically", "literally"]
        text_lower = text.lower()
        return sum(text_lower.count(filler) for filler in filler_words)
    
    def _count_repetitions(self, segments: list) -> int:
        """Count word repetitions in segments"""
        repetitions = 0
        for i in range(1, len(segments)):
            current_words = segments[i]["text"].lower().split()
            prev_words = segments[i-1]["text"].lower().split()
            
            for word in current_words:
                if word in prev_words and len(word) > 2:
                    repetitions += 1
        return repetitions
    
    def _count_incomplete_sentences(self, text: str) -> int:
        """Count potentially incomplete sentences"""
        sentences = text.split('.')
        incomplete = 0
        for sentence in sentences:
            sentence = sentence.strip()
            if sentence and not sentence.endswith(('.', '!', '?')) and len(sentence) > 5:
                incomplete += 1
        return incomplete

def demo_speech_to_text():
    """Demo function to test Speech-to-Text module"""
    print("=== Speech-to-Text Module Demo ===")
    
    # Initialize processor
    stt = SpeechToTextProcessor(model_size="base")
    
    print(f"Device: {stt.device}")
    print(f"Model size: {stt.model_size}")
    
    # Test with a sample audio file (you would provide real audio)
    # For demo, we'll simulate the process
    print("\n[Demo] Simulating audio transcription...")
    
    # Simulated transcription result
    mock_result = {
        "text": "Hello, my name is John Doe and I am applying for the software engineer position. I have five years of experience in Python development.",
        "language": "en",
        "segments": [
            {"start": 0.0, "end": 3.2, "text": "Hello, my name is John Doe", "avg_logprob": -0.3},
            {"start": 3.5, "end": 7.8, "text": "and I am applying for the software engineer position.", "avg_logprob": -0.2},
            {"start": 8.1, "end": 12.5, "text": "I have five years of experience in Python development.", "avg_logprob": -0.25}
        ],
        "duration": 12.5,
        "word_count": 21,
        "speaking_rate": 1.68
    }
    
    print(f"Transcribed text: {mock_result['text']}")
    print(f"Duration: {mock_result['duration']:.1f} seconds")
    print(f"Word count: {mock_result['word_count']}")
    
    # Analyze speech patterns
    analysis = stt.analyze_speech_patterns(mock_result)
    
    print("\n=== Speech Analysis ===")
    print(f"Speech rate: {analysis['speech_rate_wpm']:.1f} WPM")
    print(f"Average confidence: {analysis['avg_confidence']:.3f}")
    print(f"Fluency score: {analysis['fluency_score']:.3f}")
    print(f"Pause count: {analysis['pause_count']}")
    print(f"Filler words: {analysis['clarity_indicators']['filler_words']}")
    
    return analysis

if __name__ == "__main__":
    demo_speech_to_text()