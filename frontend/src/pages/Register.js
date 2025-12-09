import React, { useState } from 'react';
import { Container, TextField, Button, Box, Typography, Paper, MenuItem, Link, alpha, InputAdornment, IconButton, Fade, Zoom, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PhoneIcon from '@mui/icons-material/Phone';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const result = await register(username, email, password, 'candidate', fullName, phone);
    if (result.success) {
      alert('Candidate account created successfully! Please login.');
      navigate('/login');
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
        background: 'linear-gradient(135deg, #0A192F 0%, #1E3A5F 50%, #0D9488 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: '200%',
          height: '200%',
          background: `
            radial-gradient(circle at 30% 40%, rgba(13, 148, 136, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 70% 60%, rgba(6, 182, 212, 0.2) 0%, transparent 50%)
          `,
          animation: 'rotate-slow 25s linear infinite',
        }
      }}
    >
      {/* Animated background orbs */}
      {[1, 2, 3, 4].map((i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: `${120 + i * 40}px`,
            height: `${120 + i * 40}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha('#0D9488', 0.1)} 0%, transparent 70%)`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `float ${5 + i}s ease-in-out infinite`,
            animationDelay: `${i * 0.7}s`,
          }}
        />
      ))}

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 10 }}>
        <Zoom in timeout={700}>
          <Paper
            elevation={0}
            className="glass-card"
            sx={{
              p: 5,
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 5,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 60px rgba(13, 148, 136, 0.15)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 80px rgba(13, 148, 136, 0.25)',
              }
            }}
          >
            {/* Logo and Title */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Zoom in timeout={900} style={{ transitionDelay: '200ms' }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
                    mb: 2.5,
                    boxShadow: '0 8px 30px rgba(13, 148, 136, 0.4)',
                  }}
                >
                  <RocketLaunchIcon sx={{ fontSize: 42, color: '#fff' }} />
                </Box>
              </Zoom>
              
              <Fade in timeout={1100} style={{ transitionDelay: '400ms' }}>
                <Typography
                  variant="h3"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontWeight: 900,
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #A7F3D0 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Join IntelliHire
                </Typography>
              </Fade>
              
              <Fade in timeout={1100} style={{ transitionDelay: '600ms' }}>
                <Typography variant="body1" sx={{ color: alpha('#fff', 0.85), fontWeight: 500 }}>
                  Start your AI-powered interview journey
                </Typography>
              </Fade>
            </Box>

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
              <Fade in timeout={1300} style={{ transitionDelay: '800ms' }}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  sx={{
                    mb: 2.5,
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      color: '#fff',
                      borderRadius: 3,
                      '& fieldset': { borderColor: alpha('#fff', 0.2), borderWidth: 2 },
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.08)',
                        '& fieldset': { borderColor: alpha('#0D9488', 0.5) }
                      },
                      '&.Mui-focused': {
                        background: 'rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 0 0 3px rgba(13, 148, 136, 0.2)',
                        '& fieldset': { borderColor: '#0D9488' }
                      }
                    },
                    '& .MuiInputLabel-root': { color: alpha('#fff', 0.7), fontWeight: 500 },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#5EEAD4' }
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

              <Fade in timeout={1400} style={{ transitionDelay: '900ms' }}>
                <TextField
                  fullWidth
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  sx={{
                    mb: 2.5,
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      color: '#fff',
                      borderRadius: 3,
                      '& fieldset': { borderColor: alpha('#fff', 0.2), borderWidth: 2 },
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.08)',
                        '& fieldset': { borderColor: alpha('#0D9488', 0.5) }
                      },
                      '&.Mui-focused': {
                        background: 'rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 0 0 3px rgba(13, 148, 136, 0.2)',
                        '& fieldset': { borderColor: '#0D9488' }
                      }
                    },
                    '& .MuiInputLabel-root': { color: alpha('#fff', 0.7), fontWeight: 500 },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#5EEAD4' }
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

              <Fade in timeout={1500} style={{ transitionDelay: '1000ms' }}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  sx={{
                    mb: 2.5,
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      color: '#fff',
                      borderRadius: 3,
                      '& fieldset': { borderColor: alpha('#fff', 0.2), borderWidth: 2 },
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.08)',
                        '& fieldset': { borderColor: alpha('#0D9488', 0.5) }
                      },
                      '&.Mui-focused': {
                        background: 'rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 0 0 3px rgba(13, 148, 136, 0.2)',
                        '& fieldset': { borderColor: '#0D9488' }
                      }
                    },
                    '& .MuiInputLabel-root': { color: alpha('#fff', 0.7), fontWeight: 500 },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#5EEAD4' }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: alpha('#fff', 0.7) }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Fade>

              <Fade in timeout={1600} style={{ transitionDelay: '1100ms' }}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  sx={{
                    mb: 2.5,
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      color: '#fff',
                      borderRadius: 3,
                      '& fieldset': { borderColor: alpha('#fff', 0.2), borderWidth: 2 },
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.08)',
                        '& fieldset': { borderColor: alpha('#0D9488', 0.5) }
                      },
                      '&.Mui-focused': {
                        background: 'rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 0 0 3px rgba(13, 148, 136, 0.2)',
                        '& fieldset': { borderColor: '#0D9488' }
                      }
                    },
                    '& .MuiInputLabel-root': { color: alpha('#fff', 0.7), fontWeight: 500 },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#5EEAD4' }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon sx={{ color: alpha('#fff', 0.7) }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Fade>

              <Fade in timeout={1700} style={{ transitionDelay: '1200ms' }}>
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
                      '& fieldset': { borderColor: alpha('#fff', 0.2), borderWidth: 2 },
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.08)',
                        '& fieldset': { borderColor: alpha('#0D9488', 0.5) }
                      },
                      '&.Mui-focused': {
                        background: 'rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 0 0 3px rgba(13, 148, 136, 0.2)',
                        '& fieldset': { borderColor: '#0D9488' }
                      }
                    },
                    '& .MuiInputLabel-root': { color: alpha('#fff', 0.7), fontWeight: 500 },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#5EEAD4' }
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

              <Fade in timeout={1900} style={{ transitionDelay: '1400ms' }}>
                <Button
                  variant="contained"
                  type="submit"
                  fullWidth
                  size="large"
                  startIcon={<HowToRegIcon />}
                  sx={{
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
                    boxShadow: '0 10px 30px rgba(13, 148, 136, 0.4)',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 15px 40px rgba(13, 148, 136, 0.5)',
                      background: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    mb: 3,
                  }}
                >
                  Create Account
                </Button>
              </Fade>

              <Fade in timeout={2100} style={{ transitionDelay: '1600ms' }}>
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
                    Already have an account?{' '}
                    <Link
                      href="/login"
                      underline="hover"
                      sx={{
                        color: '#5EEAD4',
                        fontWeight: 700,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          color: '#2DD4BF',
                          textShadow: '0 0 20px rgba(94, 234, 212, 0.5)',
                        }
                      }}
                    >
                      Sign In →
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

export default Register;
