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
      // TODO: Load candidate's interview history when endpoint is available
      // const interviewsResponse = await api.interviews.getMy();
      // setMyInterviews(interviewsResponse.data.interviews || []);
      
      // For now, just complete loading
      setMyInterviews([]);
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
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <CircularProgress size={60} sx={{ color: '#fff' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      pb: 6
    }}>
      {/* Navigation Bar */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{
          background: alpha('#000', 0.2),
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${alpha('#fff', 0.1)}`
        }}
      >
        <Toolbar>
          <IconButton 
            edge="start" 
            color="inherit" 
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            <BackIcon />
          </IconButton>
          <WorkIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            My Dashboard
          </Typography>
          <Chip 
            label={user?.username}
            sx={{ 
              background: alpha('#fff', 0.2),
              color: '#fff',
              fontWeight: 600,
              mr: 1
            }}
          />
          <Button 
            variant="contained"
            size="small"
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
            sx={{
              background: alpha('#fff', 0.2),
              '&:hover': {
                background: alpha('#fff', 0.3)
              }
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {/* Welcome Header */}
        <Fade in timeout={800}>
          <Box sx={{ mb: 5, textAlign: 'center' }}>
            <Typography 
              variant="h3" 
              gutterBottom
              sx={{
                fontWeight: 900,
                color: '#fff',
                textShadow: '0 4px 20px rgba(0,0,0,0.3)'
              }}
            >
              Welcome Back, {user?.username}! 👋
            </Typography>
            <Typography 
              variant="h6"
              sx={{
                color: alpha('#fff', 0.9),
                fontWeight: 300
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
                background: alpha('#ff1744', 0.2),
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha('#ff1744', 0.3)}`,
                color: '#fff'
              }} 
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          </Zoom>
        )}

        {/* CV Upload Section */}
        <Zoom in timeout={1000}>
          <Card sx={{ 
            mb: 4,
            background: alpha('#fff', 0.15),
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha('#fff', 0.2)}`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
            }
          }}>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff'
                  }}
                >
                  <CloudUploadIcon fontSize="large" />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>
                    Upload Your CV
                  </Typography>
                  <Typography variant="body2" sx={{ color: alpha('#fff', 0.8) }}>
                    PDF, DOC, or DOCX format accepted
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  type="file"
                  inputProps={{ accept: '.pdf,.doc,.docx' }}
                  onChange={(e) => setCvFile(e.target.files[0])}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: alpha('#fff', 0.1),
                      backdropFilter: 'blur(10px)',
                      color: '#fff',
                      '& fieldset': { borderColor: alpha('#fff', 0.3) },
                      '&:hover fieldset': { borderColor: alpha('#fff', 0.5) },
                      '&.Mui-focused fieldset': { borderColor: '#FFD700' }
                    }
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleUploadCV}
                  disabled={!cvFile || uploadLoading}
                  startIcon={uploadLoading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : <UploadIcon />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                    boxShadow: '0 5px 15px rgba(254, 107, 139, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #FF8E53 30%, #FE6B8B 90%)',
                      transform: 'translateY(-2px)',
                    },
                    '&:disabled': {
                      background: alpha('#fff', 0.1)
                    }
                  }}
                >
                  Upload
                </Button>
              </Box>
              {user?.cv_url && (
                <Typography variant="caption" sx={{ mt: 2, display: 'block', color: '#4caf50', fontWeight: 600 }}>
                  ✓ CV already uploaded
                </Typography>
              )}
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
                    py: 6,
                    background: alpha('#fff', 0.05),
                    borderRadius: 2,
                    border: `1px dashed ${alpha('#fff', 0.3)}`
                  }}
                >
                  <Typography variant="h6" sx={{ color: alpha('#fff', 0.7), mb: 2 }}>
                    📬 No interviews yet
                  </Typography>
                  <Typography variant="body2" sx={{ color: alpha('#fff', 0.6) }}>
                    You'll receive interview links from recruiters via email
                  </Typography>
                </Box>
              ) : (
                <List>
                  {myInterviews.map((interview, idx) => (
                    <Fade in timeout={800 + idx * 100} key={interview.id}>
                      <ListItem
                        sx={{
                          mb: 1,
                          borderRadius: 2,
                          background: alpha('#fff', 0.1),
                          backdropFilter: 'blur(10px)',
                          '&:hover': {
                            background: alpha('#fff', 0.15)
                          }
                        }}
                        secondaryAction={
                          interview.status === 'completed' ? (
                            <Button
                              size="small"
                              startIcon={<ReportIcon />}
                              onClick={() => navigate(`/report/interview/${interview.id}`)}
                              sx={{
                                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                color: '#fff',
                                '&:hover': {
                                  background: 'linear-gradient(45deg, #21CBF3 30%, #2196F3 90%)',
                                }
                              }}
                            >
                              View Report
                            </Button>
                          ) : (
                            <Chip
                              label={interview.status}
                              color={interview.status === 'in_progress' ? 'warning' : 'default'}
                              size="small"
                              sx={{ background: alpha('#fff', 0.2), color: '#fff' }}
                            />
                          )
                        }
                      >
                        <ListItemIcon sx={{ color: '#fff' }}>
                          {getStatusIcon(interview.status)}
                        </ListItemIcon>
                        <ListItemText
                          primary={interview.job_title}
                          secondary={`Started: ${formatDate(interview.started_at)}`}
                          sx={{
                            '& .MuiListItemText-primary': { color: '#fff', fontWeight: 600 },
                            '& .MuiListItemText-secondary': { color: alpha('#fff', 0.7) }
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
            background: alpha('#fff', 0.15),
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha('#fff', 0.2)}`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Box
                sx={{
                  display: 'inline-block',
                  p: 3,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  mb: 3
                }}
              >
                <DescriptionIcon sx={{ fontSize: 60, color: '#fff' }} />
              </Box>
              <Typography variant="h5" gutterBottom sx={{ color: '#fff', fontWeight: 700 }}>
                📧 How to Start an Interview
              </Typography>
              <Typography variant="body1" sx={{ color: alpha('#fff', 0.85), mb: 2 }}>
                Recruiters will send you interview links via email. Click the link to start your AI-powered interview.
              </Typography>
              <Typography variant="body2" sx={{ color: alpha('#fff', 0.7) }}>
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
