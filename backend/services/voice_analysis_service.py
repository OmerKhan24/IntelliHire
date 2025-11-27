"""
Voice Analysis Service
Analyzes audio recordings for vocal characteristics and communication quality
"""
import os
import logging
from typing import Dict, Optional
import speech_recognition as sr
from pydub import AudioSegment
from pydub.silence import detect_nonsilent
import re

logger = logging.getLogger(__name__)

class VoiceAnalysisService:
    """Analyzes voice recordings for communication quality metrics"""
    
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.filler_words = [
            'um', 'uh', 'like', 'you know', 'sort of', 'kind of',
            'basically', 'actually', 'literally', 'i mean', 'so'
        ]
    
    def analyze_audio_file(self, audio_path: str) -> Dict:
        """
        Comprehensive audio analysis
        
        Returns dict with:
        - duration: Total length in seconds
        - speaking_pace: Words per minute
        - pause_count: Number of pauses
        - filler_word_count: Count of filler words
        - clarity_score: 0-100 based on articulation
        - confidence_score: 0-100 based on vocal patterns
        - transcription: Text transcription
        """
        try:
            # Convert webm to wav for processing
            audio = AudioSegment.from_file(audio_path)
            wav_path = audio_path.replace('.webm', '.wav')
            audio.export(wav_path, format='wav')
            
            # Basic metrics
            duration = len(audio) / 1000.0  # milliseconds to seconds
            
            # Detect pauses (silence periods)
            nonsilent_ranges = detect_nonsilent(
                audio,
                min_silence_len=500,  # 500ms silence threshold
                silence_thresh=-40  # dB
            )
            pause_count = max(0, len(nonsilent_ranges) - 1)
            
            # Transcribe audio
            transcription, word_count = self._transcribe_audio(wav_path)
            
            # Calculate speaking pace (WPM)
            speaking_pace = (word_count / duration * 60) if duration > 0 else 0
            
            # Count filler words
            filler_count = self._count_filler_words(transcription)
            
            # Calculate scores
            clarity_score = self._calculate_clarity_score(transcription, word_count)
            confidence_score = self._calculate_confidence_score(
                speaking_pace, pause_count, filler_count, duration
            )
            
            # Clean up temp wav file
            if os.path.exists(wav_path):
                os.remove(wav_path)
            
            analysis = {
                'duration': round(duration, 2),
                'word_count': word_count,
                'speaking_pace': round(speaking_pace, 1),
                'pause_count': pause_count,
                'filler_word_count': filler_count,
                'clarity_score': clarity_score,
                'confidence_score': confidence_score,
                'transcription': transcription,
                'analysis_summary': self._generate_summary(
                    speaking_pace, pause_count, filler_count, clarity_score
                )
            }
            
            logger.info(f"✅ Voice analysis complete: {word_count} words, {speaking_pace:.1f} WPM")
            return analysis
            
        except Exception as e:
            logger.error(f"❌ Voice analysis failed: {e}")
            return {
                'error': str(e),
                'duration': 0,
                'word_count': 0,
                'speaking_pace': 0,
                'pause_count': 0,
                'filler_word_count': 0,
                'clarity_score': 0,
                'confidence_score': 0,
                'transcription': '',
                'analysis_summary': 'Analysis failed'
            }
    
    def _transcribe_audio(self, wav_path: str) -> tuple:
        """Transcribe audio to text and count words"""
        try:
            with sr.AudioFile(wav_path) as source:
                audio_data = self.recognizer.record(source)
                text = self.recognizer.recognize_google(audio_data)
                word_count = len(text.split())
                return text, word_count
        except sr.UnknownValueError:
            logger.warning("Could not understand audio")
            return "", 0
        except sr.RequestError as e:
            logger.error(f"Speech recognition error: {e}")
            return "", 0
    
    def _count_filler_words(self, text: str) -> int:
        """Count filler words in transcription"""
        if not text:
            return 0
        
        text_lower = text.lower()
        count = 0
        for filler in self.filler_words:
            count += len(re.findall(r'\b' + re.escape(filler) + r'\b', text_lower))
        return count
    
    def _calculate_clarity_score(self, text: str, word_count: int) -> int:
        """Calculate clarity based on articulation and vocabulary"""
        if word_count == 0:
            return 0
        
        # Base score
        score = 70
        
        # Bonus for more words (better articulation)
        if word_count > 50:
            score += 15
        elif word_count > 20:
            score += 10
        elif word_count > 10:
            score += 5
        
        # Bonus for varied vocabulary (unique words)
        if text:
            unique_words = len(set(text.lower().split()))
            vocabulary_richness = unique_words / word_count if word_count > 0 else 0
            if vocabulary_richness > 0.7:
                score += 15
            elif vocabulary_richness > 0.5:
                score += 10
        
        return min(100, score)
    
    def _calculate_confidence_score(self, pace: float, pauses: int, fillers: int, duration: float) -> int:
        """Calculate confidence based on vocal patterns"""
        score = 70  # Base confidence
        
        # Optimal pace: 120-160 WPM
        if 120 <= pace <= 160:
            score += 20
        elif 100 <= pace < 120 or 160 < pace <= 180:
            score += 10
        elif pace < 80 or pace > 200:
            score -= 10
        
        # Fewer pauses = more confident
        pause_penalty = min(pauses * 2, 20)
        score -= pause_penalty
        
        # Fewer fillers = more confident
        filler_penalty = min(fillers * 3, 30)
        score -= filler_penalty
        
        return max(0, min(100, score))
    
    def _generate_summary(self, pace: float, pauses: int, fillers: int, clarity: int) -> str:
        """Generate human-readable analysis summary"""
        summary_parts = []
        
        # Pace analysis
        if pace < 100:
            summary_parts.append("Speaking pace is slow - consider being more concise")
        elif 120 <= pace <= 160:
            summary_parts.append("Excellent speaking pace - clear and well-paced")
        elif pace > 180:
            summary_parts.append("Speaking very quickly - slow down for clarity")
        
        # Pause analysis
        if pauses > 10:
            summary_parts.append("Many pauses detected - practice smoother delivery")
        elif pauses <= 5:
            summary_parts.append("Smooth delivery with minimal pauses")
        
        # Filler words
        if fillers > 5:
            summary_parts.append(f"High use of filler words ({fillers}) - work on eliminating these")
        elif fillers == 0:
            summary_parts.append("No filler words - excellent articulation")
        
        # Clarity
        if clarity >= 85:
            summary_parts.append("Very clear and articulate communication")
        elif clarity < 60:
            summary_parts.append("Communication could be clearer")
        
        return ". ".join(summary_parts) + "."

# Global instance
voice_analysis_service = VoiceAnalysisService()
