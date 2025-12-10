import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  alpha,
  Fade,
  Zoom,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
import {
  Work as WorkIcon,
  PlayArrow as StartIcon,
  Description as DescriptionIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CompletedIcon,
  HourglassEmpty as PendingIcon,
  Assessment as ReportIcon,
  Upload as UploadIcon,
  ArrowBack as BackIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

const CandidateDashboard = () => {
  const [myInterviews, setMyInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get candidate email from localStorage (set when they access an interview link)
      const candidateEmail = localStorage.getItem('candidate_email');
      
      if (candidateEmail) {
        try {
          const interviewsResponse = await api.interviews.getMy(candidateEmail);
          setMyInterviews(interviewsResponse.data.interviews || []);
        } catch (err) {
          console.error('Failed to load interviews:', err);
          setMyInterviews([]);
        }
      } else {
        // No email in localStorage - candidate hasn't accessed any interview yet
        setMyInterviews([]);
      }
    } catch (err) {
      setError('Failed to load dashboard: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleUploadCV = async () => {
    if (!cvFile) {
      setError('Please select a CV file');
      return;
    }

    try {
      setUploadLoading(true);
      const formData = new FormData();
      formData.append('cv', cvFile);
      
      await api.candidate.uploadCV(formData);
      alert('CV uploaded successfully!');
      setCvFile(null);
    } catch (err) {
      setError('Failed to upload CV: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploadLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CompletedIcon color="success" />;
      case 'in_progress':
        return <PendingIcon color="warning" />;
      default:
        return <ScheduleIcon color="disabled" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        sx={{
          background: 'linear-gradient(135deg, #0A192F 0%, #1E3A5F 50%, #0891B2 100%)',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ color: '#5EEAD4', mb: 2 }} />
          <Typography sx={{ color: '#fff', fontWeight: 500 }}>Loading your dashboard...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F9FAFB 0%, #E5E7EB 100%)',
      position: 'relative',
      pb: 6,
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '280px',
        background: 'linear-gradient(135deg, #0A192F 0%, #1E3A5F 50%, #0891B2 100%)',
        zIndex: 0,
      }
    }}>
      {/* Navigation Bar */}
      <AppBar 
        position="sticky"
        elevation={0}
        sx={{
          background: 'rgba(10, 25, 47, 0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Toolbar>
          <WorkIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            My Dashboard
          </Typography>
          <Chip 
            label={user?.username}
            sx={{ 
              background: 'rgba(94, 234, 212, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(94, 234, 212, 0.3)',
              color: '#5EEAD4',
              fontWeight: 600,
              mr: 1
            }}
          />
          <Button 
            variant="outlined"
            size="small"
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.3)',
              color: '#fff',
              '&:hover': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
                background: 'rgba(255, 255, 255, 0.05)'
              }
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 5, position: 'relative', zIndex: 1 }}>
        {/* Welcome Header */}
        <Fade in timeout={800}>
          <Box 
            className="glass-card-white"
            sx={{ 
              mb: 4, 
              p: 4,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
            }}
          >
            <Typography 
              variant="h3" 
              gutterBottom
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #0A192F 0%, #0891B2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              Welcome Back, {user?.username}! 👋
            </Typography>
            <Typography 
              variant="body1"
              sx={{
                color: 'text.secondary',
                fontSize: '1.1rem',
                fontWeight: 500
              }}
            >
              Browse available positions and track your interview progress
            </Typography>
          </Box>
        </Fade>

        {error && (
          <Zoom in>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)',
              }} 
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          </Zoom>
        )}

        {/* CV Upload Section */}
        <Zoom in timeout={1000}>
          <Card 
            className="hover-lift"
            sx={{ 
              mb: 4,
              borderRadius: 4,
              background: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
              color: 'white',
              border: 'none',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -100,
                right: -100,
                width: 250,
                height: 250,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            
          
            <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <CloudUploadIcon sx={{ fontSize: 40 }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Upload Your CV
                  </Typography>
                  <Typography sx={{ opacity: 0.9 }}>
                    Keep your resume updated for better opportunities
                  </Typography>
                </Box>
              </Box>
              
              <Box display="flex" gap={2} alignItems="center">
                <input
                  accept=".pdf,.doc,.docx"
                  style={{ display: 'none' }}
                  id="cv-upload"
                  type="file"
                  onChange={(e) => setCvFile(e.target.files[0])}
                />
                <label htmlFor="cv-upload" style={{ flex: 1 }}>
                  <Button
                    variant="contained"
                    component="span"
                    fullWidth
                    sx={{
                      py: 1.5,
                      background: 'rgba(255, 255, 255, 0.9)',
                      color: '#0D9488',
                      fontWeight: 600,
                      borderRadius: 2,
                      '&:hover': {
                        background: '#fff',
                      }
                    }}
                  >
                    {cvFile ? cvFile.name : 'Choose File'}
                  </Button>
                </label>
                
                <Button
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  onClick={handleUploadCV}
                  disabled={!cvFile || uploadLoading}
                  sx={{
                    py: 1.5,
                    px: 3,
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    color: '#fff',
                    fontWeight: 600,
                    borderRadius: 2,
                    '&:hover': {
                      borderColor: '#fff',
                      background: 'rgba(255, 255, 255, 0.1)',
                    }
                  }}
                >
                  {uploadLoading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Upload'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Zoom>

        {/* My Interviews Section */}
        <Zoom in timeout={1200}>
          <Card sx={{ 
            mb: 4,
            background: alpha('#fff', 0.15),
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha('#fff', 0.2)}`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ color: '#fff', fontWeight: 700 }}>
                📋 My Interviews
              </Typography>
              
              {myInterviews.length === 0 ? (
                <Box 
                  sx={{ 
                    textAlign: 'center', 
                    py: 8,
                    background: 'linear-gradient(135deg, rgba(8, 145, 178, 0.05) 0%, rgba(13, 148, 136, 0.05) 100%)',
                    borderRadius: 3,
                    border: `2px dashed ${alpha('#0891B2', 0.3)}`,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: -50,
                      right: -50,
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(8, 145, 178, 0.2) 0%, transparent 70%)',
                      animation: 'pulse-glow 3s ease-in-out infinite'
                    }
                  }}
                >
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      color: '#0891B2',
                      fontWeight: 700,
                      mb: 2,
                      textShadow: '0 2px 10px rgba(8, 145, 178, 0.3)'
                    }}
                  >
                    📬 No Interviews Yet
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: "black",
                      maxWidth: 400,
                      mx: 'auto'
                    }}
                  >
                    You'll receive interview invitations from recruiters via email
                  </Typography>
                </Box>
              ) : (
                <List sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {myInterviews.map((interview, idx) => (
                    <Fade in timeout={800 + idx * 100} key={interview.id}>
                      <ListItem
                        className="hover-lift"
                        sx={{
                          borderRadius: 3,
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.08) 100%)',
                          backdropFilter: 'blur(20px)',
                          border: `1px solid ${alpha('#0891B2', 0.2)}`,
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.3s ease',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: 4,
                            height: '100%',
                            background: interview.status === 'completed' 
                              ? 'linear-gradient(180deg, #0891B2 0%, #0D9488 100%)'
                              : interview.status === 'in_progress'
                              ? 'linear-gradient(180deg, #D97706 0%, #F59E0B 100%)'
                              : 'linear-gradient(180deg, #64748B 0%, #94A3B8 100%)'
                          },
                          '&:hover': {
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.1) 100%)',
                            borderColor: alpha('#0891B2', 0.4),
                            boxShadow: '0 8px 30px rgba(8, 145, 178, 0.2)'
                          }
                        }}
                        secondaryAction={
                          interview.status === 'completed' ? (
                            <Button
                              size="small"
                              startIcon={<ReportIcon />}
                              onClick={() => navigate(`/report/interview/${interview.id}`)}
                              sx={{
                                background: 'linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)',
                                color: '#fff',
                                fontWeight: 600,
                                px: 3,
                                py: 1,
                                borderRadius: 2,
                                textTransform: 'none',
                                boxShadow: '0 4px 15px rgba(8, 145, 178, 0.3)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 6px 20px rgba(8, 145, 178, 0.4)'
                                }
                              }}
                            >
                              View Report
                            </Button>
                          ) : (
                            <Chip
                              label={interview.status.replace('_', ' ').toUpperCase()}
                              size="small"
                              sx={{ 
                                background: interview.status === 'in_progress'
                                  ? 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)'
                                  : alpha('#64748B', 0.3),
                                color: '#fff',
                                fontWeight: 600,
                                px: 1.5,
                                borderRadius: 2,
                                border: `1px solid ${alpha('#fff', 0.2)}`
                              }}
                            />
                          )
                        }
                      >
                        <ListItemIcon 
                          sx={{ 
                            color: '#0891B2',
                            fontSize: 32,
                            minWidth: 48
                          }}
                        >
                          {getStatusIcon(interview.status)}
                        </ListItemIcon>
                        <ListItemText
                          primary={interview.job?.title || 'Interview'}
                          secondary={
                            <>
                              {interview.job?.company && `${interview.job.company} • `}
                              {interview.status === 'pending' && interview.accessed_at && `Accessed: ${formatDate(interview.accessed_at)}`}
                              {interview.status === 'in_progress' && interview.started_at && `Started: ${formatDate(interview.started_at)}`}
                              {interview.status === 'completed' && interview.completed_at && `Completed: ${formatDate(interview.completed_at)}`}
                              {interview.final_score && ` • Score: ${interview.final_score.toFixed(1)}%`}
                            </>
                          }
                          sx={{
                            '& .MuiListItemText-primary': { 
                              color: '#fff',
                              fontWeight: 700,
                              fontSize: '1.1rem',
                              mb: 0.5
                            },
                            '& .MuiListItemText-secondary': { 
                              color: alpha('#fff', 0.7),
                              fontSize: '0.9rem'
                            }
                          }}
                        />
                      </ListItem>
                    </Fade>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Zoom>

        {/* Information Card */}
        <Zoom in timeout={1400}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.08) 100%)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha('#0891B2', 0.3)}`,
            boxShadow: '0 8px 32px rgba(8, 145, 178, 0.15)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -100,
              right: -100,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(8, 145, 178, 0.15) 0%, transparent 70%)',
              animation: 'pulse-glow 4s ease-in-out infinite'
            }
          }}>
            <CardContent sx={{ p: 4, textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <Box
                sx={{
                  display: 'inline-block',
                  p: 3,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #0891B2 0%, #0D9488 100%)',
                  boxShadow: '0 8px 24px rgba(8, 145, 178, 0.3)',
                  mb: 3,
                  animation: 'float 3s ease-in-out infinite'
                }}
              >
                <DescriptionIcon sx={{ fontSize: 60, color: '#fff' }} />
              </Box>
              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{ 
                  color: '#fff',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #0891B2 0%, #0D9488 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2
                }}
              >
                📧 How to Start an Interview
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: "black",
                  mb: 2,
                  fontWeight: 500,
                  lineHeight: 1.6
                }}
              >
                Recruiters will send you interview links via email. Click the link to start your AI-powered interview.
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: alpha('#fff', 0.7),
                  lineHeight: 1.6
                }}
              >
                Make sure you have a working webcam and microphone for the best interview experience.
              </Typography>
            </CardContent>
          </Card>
        </Zoom>
      </Container>

      {/* Job Details Dialog - Removed as candidates access via links only */}
    </Box>
  );
};

export default CandidateDashboard;
