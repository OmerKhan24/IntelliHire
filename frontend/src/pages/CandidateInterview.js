import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Paper,
  Avatar,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Send as SendIcon,
  Timer as TimerIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useCVMonitoring } from '../hooks/useCVMonitoring';
import MonitoringAlert from '../components/MonitoringAlert';

const CandidateInterview = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [job, setJob] = useState(null);
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [step, setStep] = useState('setup'); // setup, interview, completed
  
  // Candidate info
  const [candidateInfo, setCandidateInfo] = useState({
    name: '',
    email: '',
    phone: '',
    cvFile: null
  });
  
  // Interview state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  
  // Voice features state
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [audioRecorder, setAudioRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  
  // Media refs
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const audioRecorderRef = useRef(null);
  
  // Warnings and monitoring
  const [warnings, setWarnings] = useState([]);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  // CV Monitoring integration
  const {
    monitoring,
    recentWarning,
    startMonitoring,
    stopMonitoring,
    getWarningStats,
    clearWarning
  } = useCVMonitoring(interview?.id, videoRef, true); // Always enabled when interview exists

  useEffect(() => {
    loadJobDetails();
    setupMediaDevices();
    
    // Add visibility change listener for tab switching detection
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cleanupMedia();
    };
  }, [jobId]);

  // Timer effect
  useEffect(() => {
    if (step === 'interview' && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && step === 'interview') {
      handleInterviewComplete();
    }
  }, [timeRemaining, step]);

  // Auto-speak question when it changes
  useEffect(() => {
    if (step === 'interview' && questions.length > 0 && currentQuestionIndex < questions.length) {
      const currentQuestion = questions[currentQuestionIndex];
      if (currentQuestion && currentQuestion.question) {
        // Auto-speak the question after a short delay
        setTimeout(() => {
          speakQuestion(currentQuestion.question);
        }, 800);
      }
    }
  }, [currentQuestionIndex, step, questions]);

  // Ensure video stream is connected when interview starts
  useEffect(() => {
    if (step === 'interview' && videoRef.current && streamRef.current) {
      console.log('🎥 Reconnecting video stream for interview...');
      videoRef.current.srcObject = streamRef.current;
      
      // Ensure video plays
      videoRef.current.play().catch(err => {
        console.error('Failed to play video:', err);
      });
      
      console.log('✅ Video stream reconnected for interview');
      
      // Start CV monitoring AFTER video is ready
      if (interview?.id && !monitoring.active) {
        console.log('🎥 Video ready, starting CV monitoring...');
        startMonitoring(interview.id).then(() => {
          console.log('✅ CV monitoring started after video setup');
        }).catch(err => {
          console.warn('⚠️ CV monitoring failed to start:', err);
        });
      }
    }
  }, [step, interview, monitoring.active, startMonitoring]);

  // Ensure video persists when question changes
  useEffect(() => {
    if (step === 'interview' && videoRef.current && streamRef.current) {
      // Reassign srcObject to maintain video across questions
      if (!videoRef.current.srcObject || videoRef.current.srcObject !== streamRef.current) {
        console.log(`🎥 Reassigning video for question ${currentQuestionIndex + 1}...`);
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(err => {
          console.error('Failed to play video:', err);
        });
      }
    }
  }, [currentQuestionIndex, step]);

  const loadJobDetails = async () => {
    try {
      const response = await api.jobs.get(jobId);
      setJob(response.data.job);
      
      // Track interview access (stores in localStorage for candidate session)
      const candidateEmail = localStorage.getItem('candidate_email');
      if (candidateEmail) {
        try {
          await api.interviews.trackAccess(jobId, { candidate_email: candidateEmail });
          console.log('📍 Interview access tracked');
        } catch (err) {
          console.warn('Failed to track interview access:', err);
        }
      }
    } catch (err) {
      setError('Failed to load job details: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const setupMediaDevices = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setVideoEnabled(true);
      setAudioEnabled(true);
      
      // Initialize Speech Recognition (STT)
      initializeSpeechRecognition();
      
      // Initialize Text-to-Speech (TTS)
      synthRef.current = window.speechSynthesis;
      
    } catch (err) {
      console.error('Media access denied:', err);
      setError('Camera and microphone access is required for the interview. Please enable and refresh.');
    }
  };

  const initializeSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          setCurrentAnswer(prev => prev + finalTranscript);
          setVoiceTranscript('');
        } else {
          setVoiceTranscript(interimTranscript);
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'no-speech') {
          addWarning('No speech detected. Please speak clearly.', 'info');
        }
      };
      
      recognitionRef.current.onend = () => {
        if (isListening) {
          // Restart if still supposed to be listening
          try {
            recognitionRef.current.start();
          } catch (err) {
            console.error('Failed to restart recognition:', err);
            setIsListening(false);
          }
        }
      };
      
      console.log('✅ Speech recognition initialized');
    } else {
      console.warn('⚠️ Speech recognition not supported in this browser');
    }
  };

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      addWarning('Speech recognition not available', 'error');
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      stopAudioRecording();
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        startAudioRecording();
      } catch (err) {
        console.error('Failed to start recognition:', err);
        addWarning('Failed to start voice recognition', 'error');
      }
    }
  };

  const speakQuestion = (questionText) => {
    if (!synthRef.current) {
      console.warn('Speech synthesis not available');
      return;
    }
    
    // Cancel any ongoing speech
    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(questionText);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.lang = 'en-US';
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const startAudioRecording = () => {
    if (!streamRef.current) return;
    
    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioRecorderRef.current = mediaRecorder;
      const chunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        setAudioChunks(prev => [...prev, audioBlob]);
      };
      
      mediaRecorder.start();
      console.log('🎤 Audio recording started');
    } catch (err) {
      console.error('Failed to start audio recording:', err);
    }
  };

  const stopAudioRecording = () => {
    if (audioRecorderRef.current && audioRecorderRef.current.state === 'recording') {
      audioRecorderRef.current.stop();
      console.log('🎤 Audio recording stopped');
    }
  };

  const cleanupMedia = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const handleVisibilityChange = () => {
    if (document.hidden && step === 'interview') {
      setTabSwitchCount(prev => prev + 1);
      addWarning('Tab switch detected', 'warning');
      
      if (tabSwitchCount >= 2) {
        setShowWarning(true);
      }
    }
  };

  const addWarning = (message, type = 'warning') => {
    const warning = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toISOString()
    };
    setWarnings(prev => [...prev, warning]);
  };

  const startInterview = async () => {
    if (!candidateInfo.name || !candidateInfo.email || !candidateInfo.cvFile) {
      setError('Please provide your name, email, and CV file to continue');
      return;
    }

    try {
      setLoading(true);
      
      // Store candidate email in localStorage for session tracking
      localStorage.setItem('candidate_email', candidateInfo.email);
      
      // Track interview access first
      await api.interviews.trackAccess(jobId, {
        candidate_name: candidateInfo.name,
        candidate_email: candidateInfo.email,
        candidate_phone: candidateInfo.phone
      });
      
      // Start interview
      const interviewResponse = await api.interviews.start({
        job_id: jobId,
        candidate_name: candidateInfo.name,
        candidate_email: candidateInfo.email,
        candidate_phone: candidateInfo.phone
      });
      setInterview(interviewResponse.data.interview);
      
      // Upload CV with interview_id
      const formData = new FormData();
      formData.append('file', candidateInfo.cvFile);
      formData.append('interview_id', interviewResponse.data.interview.id);
      
      console.log('📤 Uploading CV with interview_id:', interviewResponse.data.interview.id);
      console.log('📄 CV File:', candidateInfo.cvFile.name, candidateInfo.cvFile.size, 'bytes');
      
      try {
        await api.candidate.uploadCV(formData);
        console.log('✅ CV uploaded successfully for RAG processing');
      } catch (cvError) {
        console.error('⚠️ CV upload failed:', cvError);
        // Continue anyway - questions will be generic without RAG
      }
      
      // Get questions (will use CV for RAG if uploaded)
      const questionsResponse = await api.interviews.getQuestions(interviewResponse.data.interview.id);
      console.log('Questions response:', questionsResponse.data);
      console.log('Questions array:', questionsResponse.data.questions);
      
      if (!questionsResponse.data.questions || questionsResponse.data.questions.length === 0) {
        throw new Error('No questions returned from API');
      }
      
      setQuestions(questionsResponse.data.questions);
      
      // Set timer
      setTimeRemaining(job.duration_minutes * 60);
      
      // Start recording
      startRecording();
      
      // Change to interview step (this will trigger video reconnection and CV monitoring)
      // CV monitoring will start automatically after video is ready (see useEffect above)
      setStep('interview');
      
    } catch (err) {
      setError('Failed to start interview: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    
    try {
      const mediaRecorder = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      
      mediaRecorder.start(1000); // Record in 1-second chunks
      
      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && interview) {
          // Send video data to backend for analysis
          const formData = new FormData();
          formData.append('video', event.data);
          formData.append('interview_id', interview.id);
          
          try {
            await api.interviews.uploadVideoChunk(formData);
          } catch (err) {
            console.error('Failed to upload video chunk:', err);
          }
        }
      };
      
    } catch (err) {
      console.error('Failed to start recording:', err);
      addWarning('Recording failed to start', 'error');
    }
  };

  const submitAnswer = async () => {
    if (!currentAnswer.trim()) {
      setError('Please provide an answer before continuing');
      return;
    }

    try {
      setLoading(true);
      
      // Stop listening if active
      if (isListening) {
        toggleSpeechRecognition();
      }
      
      const currentQuestion = questions[currentQuestionIndex];
      
      // Submit text answer
      const response = await api.interviews.submitResponse(interview.id, {
        question_id: currentQuestion.id,
        answer_text: currentAnswer
      });
      
      // Upload audio recording if available
      if (audioChunks.length > 0) {
        try {
          const audioBlob = audioChunks[audioChunks.length - 1];
          const formData = new FormData();
          formData.append('audio', audioBlob, `answer_${currentQuestionIndex}.webm`);
          formData.append('response_id', response.data.response.id);
          formData.append('interview_id', interview.id);
          
          await api.interviews.uploadAudio(formData);
          console.log('🎤 Audio uploaded for voice analysis');
        } catch (audioErr) {
          console.error('⚠️ Audio upload failed:', audioErr);
          // Continue even if audio upload fails
        }
      }
      
      setCurrentAnswer('');
      setVoiceTranscript('');
      setAudioChunks([]);
      
      if (currentQuestionIndex < questions.length - 1) {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        // Auto-read next question
        setTimeout(() => {
          if (questions[nextIndex]) {
            speakQuestion(questions[nextIndex].question);
          }
        }, 500);
      } else {
        handleInterviewComplete();
      }
      
    } catch (err) {
      setError('Failed to submit answer: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleInterviewComplete = async () => {
    try {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      
      // Stop CV monitoring and get report
      console.log('🏁 Stopping CV monitoring...');
      const monitoringReport = await stopMonitoring();
      
      if (monitoringReport) {
        console.log('📊 CV Monitoring Report:', monitoringReport);
        console.log(`- Total Warnings: ${monitoringReport.total_warnings}`);
        console.log(`- Risk Level: ${monitoringReport.risk_level}`);
        console.log(`- Frames Analyzed: ${monitoringReport.total_frames_analyzed}`);
      }
      
      await api.interviews.complete(interview.id);
      setStep('completed');
      cleanupMedia();
      
      // Redirect to feedback page after a short delay
      setTimeout(() => {
        navigate(`/feedback/${interview.id}`);
      }, 2000);
      
    } catch (err) {
      console.error('Failed to complete interview:', err);
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0A192F 0%, #1E3A5F 50%, #0A192F 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress 
            size={60} 
            sx={{ 
              color: '#0891B2',
              mb: 2
            }} 
          />
          <Typography sx={{ color: '#fff', fontSize: '1.1rem' }}>
            Loading interview...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error && !job) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0A192F 0%, #1E3A5F 50%, #0A192F 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3
        }}
      >
        <Card sx={{
          maxWidth: 500,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.1) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          boxShadow: '0 8px 32px rgba(239, 68, 68, 0.2)'
        }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" sx={{ color: '#EF4444', fontWeight: 700, mb: 2 }}>
              ⚠️ Error Loading Interview
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.9)' }}>
              {error}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Setup step
  if (step === 'setup') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0A192F 0%, #1E3A5F 50%, #0A192F 100%)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(8, 145, 178, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(13, 148, 136, 0.1) 0%, transparent 50%)',
            pointerEvents: 'none'
          }
        }}
      >
      <Container maxWidth="md">
        <Box sx={{ py: 4, position: 'relative', zIndex: 1 }}>
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.1) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography 
                variant="h3" 
                gutterBottom 
                align="center"
                sx={{
                  color: '#fff',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #0891B2 0%, #0D9488 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2
                }}
              >
                🎯 Welcome to Your AI Interview
              </Typography>
              
              {job && (
                <Box 
                  sx={{ 
                    mb: 4,
                    p: 3,
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: 2,
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <Typography 
                    variant="h5" 
                    gutterBottom
                    sx={{ 
                      color: '#fff',
                      fontWeight: 700
                    }}
                  >
                    Position: {job.title}
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
                    {job.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip 
                      icon={<TimerIcon />} 
                      label={`Duration: ${job.duration_minutes} minutes`}
                      sx={{
                        background: 'linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)',
                        color: '#fff',
                        fontWeight: 600,
                        border: '1px solid rgba(255,255,255,0.2)'
                      }}
                    />
                    <Chip 
                      label={`${questions.length || 'Multiple'} Questions`}
                      sx={{
                        background: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
                        color: '#fff',
                        fontWeight: 600,
                        border: '1px solid rgba(255,255,255,0.2)'
                      }}
                    />
                  </Box>
                </Box>
              )}

              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3,
                    background: 'rgba(239, 68, 68, 0.15)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#fff'
                  }}
                >
                  {error}
                </Alert>
              )}

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Candidate Information
                  </Typography>
                  
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={candidateInfo.name}
                    onChange={(e) => setCandidateInfo(prev => ({...prev, name: e.target.value}))}
                    sx={{ mb: 2 }}
                    required
                  />
                  
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={candidateInfo.email}
                    onChange={(e) => setCandidateInfo(prev => ({...prev, email: e.target.value}))}
                    sx={{ mb: 2 }}
                    required
                  />
                  
                  <TextField
                    fullWidth
                    label="Phone (Optional)"
                    value={candidateInfo.phone}
                    onChange={(e) => setCandidateInfo(prev => ({...prev, phone: e.target.value}))}
                    sx={{ mb: 2 }}
                  />
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Upload Your CV (PDF or Word) *
                    </Typography>
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      sx={{ py: 1.5, textTransform: 'none' }}
                    >
                      {candidateInfo.cvFile ? candidateInfo.cvFile.name : 'Choose CV File'}
                      <input
                        type="file"
                        hidden
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setCandidateInfo(prev => ({...prev, cvFile: file}));
                          }
                        }}
                      />
                    </Button>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Camera Preview
                  </Typography>
                  
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{
                        width: '100%',
                        maxWidth: 300,
                        height: 200,
                        borderRadius: 8,
                        backgroundColor: '#000',
                        objectFit: 'cover'
                      }}
                    />
                    
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant={videoEnabled ? "contained" : "outlined"}
                        startIcon={videoEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
                        onClick={toggleVideo}
                        sx={{ mr: 2 }}
                      >
                        {videoEnabled ? 'Video On' : 'Video Off'}
                      </Button>
                      
                      <Button
                        variant={audioEnabled ? "contained" : "outlined"}
                        startIcon={audioEnabled ? <MicIcon /> : <MicOffIcon />}
                        onClick={toggleAudio}
                      >
                        {audioEnabled ? 'Mic On' : 'Mic Off'}
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  <strong>Important:</strong> This interview will be recorded and analyzed by AI. 
                  Please ensure you have a stable internet connection and are in a quiet environment. 
                  Tab switching will be monitored.
                </Typography>
              </Alert>

              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={startInterview}
                  disabled={!candidateInfo.name || !candidateInfo.email || !candidateInfo.cvFile || !videoEnabled || !audioEnabled || loading}
                  sx={{ px: 6, py: 1.5 }}
                >
                  {loading ? <CircularProgress size={20} /> : 'Start Interview'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
      </Box>
    );
  }

  // Interview in progress
  if (step === 'interview') {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 2 }}>
          {/* Header with timer and progress */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TimerIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    {formatTime(timeRemaining)}
                  </Typography>
                  {tabSwitchCount > 0 && (
                    <Chip 
                      icon={<WarningIcon />}
                      label={`${tabSwitchCount} warnings`}
                      color="warning"
                      size="small"
                      sx={{ ml: 2 }}
                    />
                  )}
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={progress} 
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                  {isRecording && (
                    <Chip 
                      label="Recording" 
                      color="error" 
                      size="small"
                      sx={{ mr: 2 }}
                    />
                  )}
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {candidateInfo.name.charAt(0)}
                  </Avatar>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* CV Monitoring Alert */}
          <MonitoringAlert
            warning={recentWarning}
            riskScore={monitoring.riskScore}
            riskLevel={monitoring.riskLevel}
            onDismiss={clearWarning}
          />

          <Grid container spacing={3}>
            {/* Video feed */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Video Feed
                  </Typography>
                  
                  <Box sx={{ position: 'relative' }}>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{
                        width: '100%',
                        height: 250,
                        borderRadius: 8,
                        backgroundColor: '#000',
                        objectFit: 'cover'
                      }}
                    />
                    
                    {/* Monitoring Status Badge */}
                    {monitoring.active && (
                      <Chip
                        label="Monitoring Active"
                        color="primary"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          animation: 'pulse 2s infinite',
                          '@keyframes pulse': {
                            '0%, 100%': { opacity: 1 },
                            '50%': { opacity: 0.7 }
                          }
                        }}
                      />
                    )}
                  </Box>
                  
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Button
                      variant={videoEnabled ? "contained" : "outlined"}
                      startIcon={videoEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
                      onClick={toggleVideo}
                      sx={{ mr: 1 }}
                      size="small"
                    >
                      Video
                    </Button>
                    
                    <Button
                      variant={audioEnabled ? "contained" : "outlined"}
                      startIcon={audioEnabled ? <MicIcon /> : <MicOffIcon />}
                      onClick={toggleAudio}
                      size="small"
                    >
                      Audio
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Question and answer */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Interview Question
                  </Typography>
                  
                  {currentQuestion && (
                    <Paper sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
                      <Typography variant="h6" gutterBottom>
                        {currentQuestion.question}
                      </Typography>
                      {currentQuestion.description && (
                        <Typography color="text.secondary">
                          {currentQuestion.description}
                        </Typography>
                      )}
                    </Paper>
                  )}

                  {/* Voice Controls */}
                  <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant={isListening ? "contained" : "outlined"}
                      color={isListening ? "error" : "primary"}
                      startIcon={isListening ? <MicIcon /> : <MicOffIcon />}
                      onClick={toggleSpeechRecognition}
                      sx={{ flex: 1, minWidth: '200px' }}
                    >
                      {isListening ? '🎙️ Stop Speaking' : '🎤 Start Speaking'}
                    </Button>
                    
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => speakQuestion(questions[currentQuestionIndex]?.question)}
                      disabled={isSpeaking}
                      sx={{ flex: 1, minWidth: '200px' }}
                    >
                      {isSpeaking ? '🔊 Speaking...' : '🔊 Replay Question'}
                    </Button>
                    
                    {isSpeaking && (
                      <Button
                        variant="outlined"
                        color="warning"
                        onClick={stopSpeaking}
                        size="small"
                      >
                        ⏸️ Stop
                      </Button>
                    )}
                  </Box>

                  {/* Live transcription indicator */}
                  {isListening && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MicIcon sx={{ animation: 'pulse 1.5s infinite' }} />
                        <span>Listening... {voiceTranscript && `"${voiceTranscript}"`}</span>
                      </Box>
                    </Alert>
                  )}

                  <TextField
                    fullWidth
                    multiline
                    rows={8}
                    label="Your Answer"
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Type your answer here or use the 'Start Speaking' button to answer by voice..."
                    sx={{ mb: 3 }}
                  />

                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Take your time to provide a thoughtful answer
                    </Typography>
                    
                    <Button
                      variant="contained"
                      endIcon={<SendIcon />}
                      onClick={submitAnswer}
                      disabled={loading || !currentAnswer.trim()}
                      size="large"
                    >
                      {loading ? <CircularProgress size={20} /> : 
                       currentQuestionIndex === questions.length - 1 ? 'Complete Interview' : 'Next Question'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Warning Dialog */}
        <Dialog open={showWarning} onClose={() => setShowWarning(false)}>
          <DialogTitle>Warning: Tab Switching Detected</DialogTitle>
          <DialogContent>
            <Alert severity="warning">
              Multiple tab switches have been detected. Please stay on this tab during the interview.
              Continued tab switching may affect your interview evaluation.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowWarning(false)}>I Understand</Button>
          </DialogActions>
        </Dialog>
      </Container>
    );
  }

  // Interview completed
  if (step === 'completed') {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Card>
            <CardContent>
              <Typography variant="h4" gutterBottom color="primary">
                Interview Completed!
              </Typography>
              
              <Typography variant="h6" gutterBottom>
                Thank you, {candidateInfo.name}
              </Typography>
              
              <Typography color="text.secondary" paragraph>
                Your interview has been successfully submitted and will be reviewed by our AI system.
                You should receive feedback via email within 24-48 hours.
              </Typography>

              <Alert severity="success" sx={{ mb: 3 }}>
                Your responses have been recorded and analyzed. The interviewer will be notified
                of your completion and can access your detailed report.
              </Alert>

              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Interview Summary
                </Typography>
                
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h4" color="primary">
                        {questions.length}
                      </Typography>
                      <Typography color="text.secondary">
                        Questions Answered
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h4" color="success.main">
                        {job?.duration_minutes}
                      </Typography>
                      <Typography color="text.secondary">
                        Minutes Allocated
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>

              <Button
                variant="outlined"
                onClick={() => navigate('/')}
                sx={{ mt: 4 }}
              >
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Container>
    );
  }

  return null;
};

export default CandidateInterview;