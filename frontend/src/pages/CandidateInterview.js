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
    phone: ''
  });
  
  // Interview state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  
  // Media refs
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  
  // Warnings and monitoring
  const [warnings, setWarnings] = useState([]);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

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

  const loadJobDetails = async () => {
    try {
      const response = await api.jobs.get(jobId);
      setJob(response.data.job);
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
    } catch (err) {
      console.error('Media access denied:', err);
      setError('Camera and microphone access is required for the interview. Please enable and refresh.');
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
    if (!candidateInfo.name || !candidateInfo.email) {
      setError('Please provide your name and email to continue');
      return;
    }

    try {
      setLoading(true);
      
      // Start interview
      const interviewResponse = await api.interviews.start(jobId, candidateInfo);
      setInterview(interviewResponse.data.interview);
      
      // Get questions
      const questionsResponse = await api.interviews.getQuestions(interviewResponse.data.interview.id);
      setQuestions(questionsResponse.data.questions);
      
      // Set timer
      setTimeRemaining(job.duration_minutes * 60);
      setStep('interview');
      
      // Start recording
      startRecording();
      
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
      
      const currentQuestion = questions[currentQuestionIndex];
      
      await api.interviews.submitAnswer(interview.id, {
        question_id: currentQuestion.id,
        answer_text: currentAnswer,
        question_index: currentQuestionIndex
      });
      
      setCurrentAnswer('');
      
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
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
      
      await api.interviews.complete(interview.id);
      setStep('completed');
      cleanupMedia();
      
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
      <Container maxWidth="md">
        <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error && !job) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  // Setup step
  if (step === 'setup') {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h4" gutterBottom align="center">
                Welcome to Your AI Interview
              </Typography>
              
              {job && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Position: {job.title}
                  </Typography>
                  <Typography color="text.secondary" paragraph>
                    {job.description}
                  </Typography>
                  <Chip 
                    icon={<TimerIcon />} 
                    label={`Duration: ${job.duration_minutes} minutes`}
                    sx={{ mr: 2 }}
                  />
                  <Chip 
                    label={`${questions.length || 'Multiple'} Questions`}
                    color="primary"
                  />
                </Box>
              )}

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
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
                    sx={{ mb: 3 }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Camera Preview
                  </Typography>
                  
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      style={{
                        width: '100%',
                        maxWidth: 300,
                        height: 200,
                        borderRadius: 8,
                        backgroundColor: '#000'
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
                  disabled={!candidateInfo.name || !candidateInfo.email || !videoEnabled || !audioEnabled || loading}
                  sx={{ px: 6, py: 1.5 }}
                >
                  {loading ? <CircularProgress size={20} /> : 'Start Interview'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
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

          <Grid container spacing={3}>
            {/* Video feed */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Video Feed
                  </Typography>
                  
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    style={{
                      width: '100%',
                      height: 250,
                      borderRadius: 8,
                      backgroundColor: '#000'
                    }}
                  />
                  
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

                  <TextField
                    fullWidth
                    multiline
                    rows={8}
                    label="Your Answer"
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Type your answer here... You can also speak your answer if you prefer."
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