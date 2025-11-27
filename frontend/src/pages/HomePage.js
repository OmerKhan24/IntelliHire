import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  alpha,
  Fade,
  Zoom,
  Slide,
  Chip,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SecurityIcon from '@mui/icons-material/Security';
import LogoutIcon from '@mui/icons-material/Logout';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SpeedIcon from '@mui/icons-material/Speed';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import WorkIcon from '@mui/icons-material/Work';
import DescriptionIcon from '@mui/icons-material/Description';
import LinkIcon from '@mui/icons-material/Link';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, logout, isInterviewer, isCandidate } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <PsychologyIcon sx={{ fontSize: 60 }} />,
      title: 'AI-Powered RAG Technology',
      description: 'Intelligent question generation using Retrieval-Augmented Generation based on job requirements and candidate profiles',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      delay: 100
    },
    {
      icon: <VideoCallIcon sx={{ fontSize: 60 }} />,
      title: 'Real-Time Analysis',
      description: 'Live monitoring with emotion detection, gaze tracking, and behavioral analysis for comprehensive evaluation',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      delay: 200
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 60 }} />,
      title: 'Multi-Modal Scoring',
      description: 'Advanced scoring combining speech recognition, video analysis, and content evaluation for accurate assessment',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      delay: 300
    },
    {
      icon: <VerifiedUserIcon sx={{ fontSize: 60 }} />,
      title: 'Anti-Cheating System',
      description: 'Sophisticated detection of mobile usage, gaze deviation, multiple faces, and suspicious behavior patterns',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      delay: 400
    }
  ];

  const stats = [
    { number: '95%', label: 'Accuracy Rate', icon: <TrendingUpIcon fontSize="large" /> },
    { number: '50%', label: 'Time Saved', icon: <SpeedIcon fontSize="large" /> },
    { number: '100%', label: 'Automated', icon: <SmartToyIcon fontSize="large" /> },
    { number: '24/7', label: 'Available', icon: <AssessmentIcon fontSize="large" /> }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated floating background elements */}
      <Box
        sx={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
          top: '-10%',
          left: '-5%',
          animation: 'float 8s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
            '33%': { transform: 'translate(30px, -30px) rotate(120deg)' },
            '66%': { transform: 'translate(-20px, 20px) rotate(240deg)' }
          }
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          bottom: '-5%',
          right: '-3%',
          animation: 'float 10s ease-in-out infinite 1s'
        }}
      />

      {/* Navigation Bar */}
      <AppBar 
        position="sticky"
        elevation={0}
        sx={{
          background: alpha('#000', 0.2),
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${alpha('#fff', 0.1)}`
        }}
      >
        <Toolbar>
          <SmartToyIcon sx={{ mr: 1.5, fontSize: 30 }} />
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 800 }}>
            IntelliHire
          </Typography>
          {user ? (
            <>
              <Chip
                label={`${user.username} (${user.role})`}
                sx={{ 
                  mr: 2,
                  background: alpha('#fff', 0.2),
                  color: '#fff',
                  fontWeight: 600
                }}
              />
              <IconButton 
                color="inherit" 
                onClick={handleLogout}
                sx={{
                  background: alpha('#fff', 0.1),
                  '&:hover': {
                    background: alpha('#fff', 0.2)
                  }
                }}
              >
                <LogoutIcon />
              </IconButton>
            </>
          ) : (
            <>
              <Button 
                color="inherit" 
                onClick={() => navigate('/login')}
                sx={{ 
                  mr: 1,
                  fontWeight: 600,
                  '&:hover': { background: alpha('#fff', 0.1) }
                }}
              >
                Login
              </Button>
              <Button 
                variant="contained"
                onClick={() => navigate('/register')}
                sx={{
                  background: alpha('#fff', 0.2),
                  fontWeight: 600,
                  '&:hover': {
                    background: alpha('#fff', 0.3)
                  }
                }}
              >
                Register
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Fade in timeout={800}>
            <Box>
              <Typography 
                variant="h1" 
                component="h1" 
                gutterBottom
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '3rem', md: '4.5rem' },
                  background: 'linear-gradient(45deg, #fff 30%, #E0E7FF 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 5px 30px rgba(0,0,0,0.3)',
                  mb: 2
                }}
              >
                Welcome to IntelliHire
              </Typography>
              <Typography 
                variant="h4" 
                sx={{ 
                  color: alpha('#fff', 0.95), 
                  mb: 5,
                  fontWeight: 300
                }}
              >
                🤖 AI-Powered Interview System for Smart Recruitment
              </Typography>
            </Box>
          </Fade>
          
          <Zoom in timeout={1000}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 5, flexWrap: 'wrap' }}>
              <Chip 
                icon={<AutoAwesomeIcon sx={{ color: '#fff !important' }} />}
                label="RAG Technology" 
                sx={{ 
                  background: alpha('#fff', 0.2),
                  backdropFilter: 'blur(10px)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  py: 2.5,
                  px: 1
                }}
              />
              <Chip 
                icon={<RocketLaunchIcon sx={{ color: '#fff !important' }} />}
                label="Real-time Analysis" 
                sx={{ 
                  background: alpha('#fff', 0.2),
                  backdropFilter: 'blur(10px)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  py: 2.5,
                  px: 1
                }}
              />
              <Chip 
                label="Multi-modal Scoring" 
                sx={{ 
                  background: alpha('#fff', 0.2),
                  backdropFilter: 'blur(10px)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  py: 2.5,
                  px: 1
                }}
              />
              <Chip 
                label="Anti-Cheating" 
                sx={{ 
                  background: alpha('#fff', 0.2),
                  backdropFilter: 'blur(10px)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  py: 2.5,
                  px: 1
                }}
              />
            </Box>
          </Zoom>

          <Slide direction="up" in timeout={1200}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              {!user && (
                <>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/login')}
                    sx={{ 
                      px: 5, 
                      py: 2,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                      boxShadow: '0 8px 25px rgba(254, 107, 139, 0.4)',
                      '&:hover': {
                        transform: 'translateY(-3px) scale(1.05)',
                        boxShadow: '0 12px 35px rgba(254, 107, 139, 0.6)',
                      }
                    }}
                  >
                    Get Started 🚀
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/register')}
                    sx={{ 
                      px: 5, 
                      py: 2,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: '#fff',
                      borderColor: alpha('#fff', 0.5),
                      borderWidth: 2,
                      '&:hover': {
                        borderColor: '#fff',
                        borderWidth: 2,
                        background: alpha('#fff', 0.1),
                        transform: 'translateY(-3px)',
                      }
                    }}
                  >
                    Register Now
                  </Button>
                </>
              )}
              {isInterviewer() && (
                <>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/create-job')}
                    startIcon={<WorkIcon />}
                    sx={{ 
                      px: 5, 
                      py: 2,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                      boxShadow: '0 8px 25px rgba(254, 107, 139, 0.4)',
                      '&:hover': {
                        transform: 'translateY(-3px) scale(1.05)',
                        boxShadow: '0 12px 35px rgba(254, 107, 139, 0.6)',
                      }
                    }}
                  >
                    Create Interview Job
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/dashboard')}
                    sx={{ 
                      px: 5, 
                      py: 2,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: '#fff',
                      borderColor: alpha('#fff', 0.5),
                      borderWidth: 2,
                      '&:hover': {
                        borderColor: '#fff',
                        borderWidth: 2,
                        background: alpha('#fff', 0.1),
                        transform: 'translateY(-3px)',
                      }
                    }}
                  >
                    View Dashboard
                  </Button>
                </>
              )}
              {isCandidate() && (
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/my-interviews')}
                  startIcon={<DescriptionIcon />}
                  sx={{ 
                    px: 5, 
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    background: 'linear-gradient(45deg, #11998e 30%, #38ef7d 90%)',
                    boxShadow: '0 8px 25px rgba(17, 153, 142, 0.4)',
                    '&:hover': {
                      transform: 'translateY(-3px) scale(1.05)',
                      boxShadow: '0 12px 35px rgba(17, 153, 142, 0.6)',
                    }
                  }}
                >
                  My Interviews 📋
                </Button>
              )}
            </Box>
          </Slide>
        </Box>

        {/* Stats Section */}
        <Box sx={{ py: 6 }}>
          <Grid container spacing={4}>
            {stats.map((stat, idx) => (
              <Grid item xs={12} md={4} key={idx}>
                <Zoom in timeout={1000 + idx * 200}>
                  <Card
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      background: alpha('#fff', 0.15),
                      backdropFilter: 'blur(20px)',
                      border: `1px solid ${alpha('#fff', 0.2)}`,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-10px) scale(1.05)',
                        boxShadow: '0 15px 45px rgba(0,0,0,0.2)',
                        border: `1px solid ${alpha('#fff', 0.4)}`
                      }
                    }}
                  >
                    <Box sx={{ 
                      display: 'inline-block',
                      p: 2,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)',
                      mb: 2
                    }}>
                      {React.cloneElement(stat.icon, { sx: { fontSize: 48, color: '#fff' } })}
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: '#fff', mb: 1 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="h6" sx={{ color: alpha('#fff', 0.9), fontWeight: 600 }}>
                      {stat.label}
                    </Typography>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Features Section */}
        <Box sx={{ py: 8 }}>
          <Typography 
            variant="h3" 
            textAlign="center" 
            gutterBottom 
            sx={{ 
              mb: 6,
              fontWeight: 900,
              color: '#fff',
              textShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}
          >
            ⚡ Powerful Features
          </Typography>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Zoom in timeout={1200 + index * 150}>
                  <Card sx={{ 
                    height: '100%',
                    background: alpha('#fff', 0.15),
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${alpha('#fff', 0.2)}`,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      transform: 'translateY(-8px)',
                      boxShadow: '0 15px 45px rgba(0,0,0,0.2)',
                      border: `1px solid ${alpha('#fff', 0.4)}`
                    } 
                  }}>
                    <CardContent sx={{ p: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Box 
                          sx={{ 
                            p: 2,
                            borderRadius: 2,
                            background: feature.gradient,
                            mr: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {React.cloneElement(feature.icon, { sx: { fontSize: 40, color: '#fff' } })}
                        </Box>
                        <Typography variant="h5" component="h3" sx={{ fontWeight: 700, color: '#fff' }}>
                          {feature.title}
                        </Typography>
                      </Box>
                      <Typography sx={{ color: alpha('#fff', 0.9), fontSize: '1.05rem', lineHeight: 1.7 }}>
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* How it Works Section */}
        <Box sx={{ py: 8 }}>
          <Typography 
            variant="h3" 
            textAlign="center" 
            gutterBottom 
            sx={{ 
              mb: 6,
              fontWeight: 900,
              color: '#fff',
              textShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}
          >
            🎯 How It Works
          </Typography>
          
          <Grid container spacing={4}>
            {[
              { num: 1, title: 'Create Job', desc: 'Define job requirements, description, and scoring criteria', icon: <WorkIcon /> },
              { num: 2, title: 'Generate Link', desc: 'Share interview link with candidates for easy access', icon: <LinkIcon /> },
              { num: 3, title: 'AI Interview', desc: 'Candidates take AI-powered interviews with real-time monitoring', icon: <SmartToyIcon /> },
              { num: 4, title: 'Get Reports', desc: 'Receive detailed analysis and ranking of all candidates', icon: <AssessmentIcon /> }
            ].map((step, idx) => (
              <Grid item xs={12} md={3} key={idx}>
                <Fade in timeout={1400 + idx * 200}>
                  <Paper sx={{ 
                    p: 4, 
                    textAlign: 'center', 
                    height: '100%',
                    background: alpha('#fff', 0.15),
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${alpha('#fff', 0.2)}`,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-10px)',
                      boxShadow: '0 15px 45px rgba(0,0,0,0.2)'
                    }
                  }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #FE6B8B 0%, #FF8E53 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto',
                        mb: 3,
                        boxShadow: '0 8px 25px rgba(254, 107, 139, 0.4)'
                      }}
                    >
                      <Typography variant="h3" sx={{ fontWeight: 900, color: '#fff' }}>
                        {step.num}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2, color: '#fff' }}>
                      {React.cloneElement(step.icon, { sx: { fontSize: 48 } })}
                    </Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#fff' }}>
                      {step.title}
                    </Typography>
                    <Typography sx={{ color: alpha('#fff', 0.85) }}>
                      {step.desc}
                    </Typography>
                  </Paper>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA Section */}
        <Box sx={{ py: 8, mb: 6 }}>
          <Zoom in timeout={1800}>
            <Paper sx={{ 
              p: 6, 
              textAlign: 'center',
              background: alpha('#000', 0.3),
              backdropFilter: 'blur(30px)',
              border: `2px solid ${alpha('#fff', 0.3)}`,
              boxShadow: '0 15px 50px rgba(0,0,0,0.3)',
              borderRadius: 4
            }}>
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 900, color: '#fff' }}>
                🚀 Ready to Start Smart Hiring?
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, color: alpha('#fff', 0.9), fontWeight: 300 }}>
                Create your first AI-powered interview in minutes
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/create-job')}
                sx={{ 
                  px: 6,
                  py: 2.5,
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                  boxShadow: '0 8px 30px rgba(254, 107, 139, 0.5)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #FF8E53 30%, #FE6B8B 90%)',
                    transform: 'translateY(-5px) scale(1.05)',
                    boxShadow: '0 15px 45px rgba(254, 107, 139, 0.7)',
                  }
                }}
              >
                Get Started Now ✨
              </Button>
            </Paper>
          </Zoom>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;