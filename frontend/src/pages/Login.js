import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Box, Typography, Paper, Link, alpha, InputAdornment, IconButton, Alert, Fade, Zoom } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [sessionExpiredMsg, setSessionExpiredMsg] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    // Check if redirected due to session expiration
    const params = new URLSearchParams(location.search);
    const sessionExpired = params.get('session') === 'expired' || 
                          sessionStorage.getItem('sessionExpired') === 'true';
    
    if (sessionExpired) {
      setSessionExpiredMsg(true);
      sessionStorage.removeItem('sessionExpired');
      
      // Auto-hide message after 8 seconds
      setTimeout(() => setSessionExpiredMsg(false), 8000);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSessionExpiredMsg(false);
    
    const result = await login(username, password);
    if (result.success) {
      // Check if there's a redirect path
      const redirectPath = sessionStorage.getItem('redirectAfterLogin');
      sessionStorage.removeItem('redirectAfterLogin');
      
      // If no redirect path, send user to appropriate dashboard based on role
      if (!redirectPath) {
        const userRole = result.user?.role;
        if (userRole === 'admin') {
          navigate('/admin');
        } else if (userRole === 'interviewer') {
          navigate('/dashboard');
        } else if (userRole === 'employee') {
          navigate('/employee-dashboard');
        } else if (userRole === 'candidate') {
          navigate('/my-interviews');
        } else {
          navigate('/');
        }
      } else {
        navigate(redirectPath);
      }
    } else {
      setError(result.error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0A192F 0%, #1E3A5F 50%, #0891B2 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: '200%',
          height: '200%',
          background: `
            radial-gradient(circle at 20% 50%, rgba(8, 145, 178, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(14, 165, 233, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(6, 182, 212, 0.2) 0%, transparent 50%)
          `,
          animation: 'rotate-slow 30s linear infinite',
        }
      }}
    >
      {/* Animated background orbs */}
      {[1, 2, 3, 4, 5].map((i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: `${150 + i * 50}px`,
            height: `${150 + i * 50}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha('#0891B2', 0.08)} 0%, transparent 70%)`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `float ${6 + i}s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`,
          }}
        />
      ))}

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(20px, -20px) scale(1.1); }
            50% { transform: translate(-15px, -30px) scale(0.95); }
            75% { transform: translate(25px, 15px) scale(1.05); }
          }
          @keyframes rotate-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 40px rgba(8, 145, 178, 0.4), inset 0 0 40px rgba(8, 145, 178, 0.1); }
            50% { box-shadow: 0 0 60px rgba(8, 145, 178, 0.6), inset 0 0 60px rgba(8, 145, 178, 0.15); }
          }
        `}
      </style>

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 10 }}>
        <Zoom in timeout={800}>
          <Paper
            elevation={0}
            className="glass-card"
            sx={{
              p: 6,
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 5,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 80px rgba(99, 102, 241, 0.2)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 100px rgba(99, 102, 241, 0.3)',
              }
            }}
          >
            {/* Logo and Title */}
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Zoom in timeout={1000} style={{ transitionDelay: '200ms' }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 90,
                    height: 90,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0891B2 0%, #0E7490 100%)',
                    mb: 3,
                    boxShadow: '0 10px 40px rgba(8, 145, 178, 0.4)',
                    animation: 'pulse-glow 3s ease-in-out infinite',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      inset: -2,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #0891B2, #06B6D4, #0891B2)',
                      backgroundSize: '200% 200%',
                      animation: 'gradient-shift 3s ease infinite',
                      zIndex: -1,
                      filter: 'blur(10px)',
                    }
                  }}
                >
                  <SmartToyIcon sx={{ fontSize: 48, color: '#fff' }} />
                </Box>
              </Zoom>
              
              <Fade in timeout={1200} style={{ transitionDelay: '400ms' }}>
                <Typography
                  variant="h3"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontWeight: 900,
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #BAE6FD 50%, #A5F3FC 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Welcome Back
                </Typography>
              </Fade>
              
              <Fade in timeout={1200} style={{ transitionDelay: '600ms' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <AutoAwesomeIcon sx={{ color: '#67E8F9', fontSize: 20 }} />
                  <Typography variant="body1" sx={{ color: alpha('#fff', 0.85), fontWeight: 500 }}>
                    Sign in to IntelliHire AI Platform
                  </Typography>
                  <AutoAwesomeIcon sx={{ color: '#67E8F9', fontSize: 20 }} />
                </Box>
              </Fade>
            </Box>

            {/* Session Expired Alert */}
            {sessionExpiredMsg && (
              <Fade in>
                <Alert 
                  severity="warning" 
                  sx={{ 
                    mb: 3,
                    background: 'rgba(251, 191, 36, 0.15)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(251, 191, 36, 0.3)',
                    color: '#fff',
                    borderRadius: 3,
                    '& .MuiAlert-icon': {
                      color: '#FCD34D'
                    }
                  }}
                  onClose={() => setSessionExpiredMsg(false)}
                >
                  <strong>Session Expired</strong> - Your session has timed out. Please login again.
                </Alert>
              </Fade>
            )}

            {error && (
              <Fade in>
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    background: 'rgba(239, 68, 68, 0.15)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#fff',
                    borderRadius: 3,
                    '& .MuiAlert-icon': {
                      color: '#FCA5A5'
                    }
                  }}
                  onClose={() => setError(null)}
                >
                  {error}
                </Alert>
              </Fade>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Fade in timeout={1400} style={{ transitionDelay: '800ms' }}>
                <TextField
                  fullWidth
                  label="Username or Email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      color: '#fff',
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      '& fieldset': {
                        borderColor: alpha('#fff', 0.2),
                        borderWidth: 2,
                      },
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.08)',
                        '& fieldset': {
                          borderColor: alpha('#6366F1', 0.5),
                        }
                      },
                      '&.Mui-focused': {
                        background: 'rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.2)',
                        '& fieldset': {
                          borderColor: '#6366F1',
                        }
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: alpha('#fff', 0.7),
                      fontWeight: 500,
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#A5B4FC',
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: alpha('#fff', 0.7) }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Fade>

              <Fade in timeout={1600} style={{ transitionDelay: '1000ms' }}>
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  sx={{
                    mb: 4,
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      color: '#fff',
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      '& fieldset': {
                        borderColor: alpha('#fff', 0.2),
                        borderWidth: 2,
                      },
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.08)',
                        '& fieldset': {
                          borderColor: alpha('#6366F1', 0.5),
                        }
                      },
                      '&.Mui-focused': {
                        background: 'rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.2)',
                        '& fieldset': {
                          borderColor: '#6366F1',
                        }
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: alpha('#fff', 0.7),
                      fontWeight: 500,
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#A5B4FC',
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: alpha('#fff', 0.7) }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ 
                            color: alpha('#fff', 0.7),
                            '&:hover': {
                              color: '#fff',
                              background: alpha('#fff', 0.1),
                            }
                          }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Fade>

              <Fade in timeout={1800} style={{ transitionDelay: '1200ms' }}>
                <Button
                  variant="contained"
                  type="submit"
                  fullWidth
                  size="large"
                  startIcon={<LoginIcon />}
                  sx={{
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #0891B2 0%, #0E7490 50%, #155E75 100%)',
                    backgroundSize: '200% 200%',
                    animation: 'gradient-shift 3s ease infinite',
                    boxShadow: '0 10px 30px rgba(8, 145, 178, 0.4)',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 15px 40px rgba(8, 145, 178, 0.5)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    mb: 3,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                      transition: 'left 0.5s',
                    },
                    '&:hover::before': {
                      left: '100%',
                    }
                  }}
                >
                  Sign In to Dashboard
                </Button>
              </Fade>

              <Fade in timeout={2000} style={{ transitionDelay: '1400ms' }}>
                <Box
                  sx={{
                    textAlign: 'center',
                    p: 3,
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 3,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }
                  }}
                >
                  <Typography variant="body2" sx={{ color: alpha('#fff', 0.85), fontWeight: 500 }}>
                    Don't have an account?{' '}
                    <Link
                      href="/register"
                      underline="hover"
                      sx={{
                        color: '#67E8F9',
                        fontWeight: 700,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          color: '#22D3EE',
                          textShadow: '0 0 20px rgba(103, 232, 249, 0.5)',
                        }
                      }}
                    >
                      Create Account →
                    </Link>
                  </Typography>
                </Box>
              </Fade>
            </Box>
          </Paper>
        </Zoom>
      </Container>
    </Box>
  );
};

export default Login;
