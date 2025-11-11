import React, { useState } from 'react';
import { Container, TextField, Button, Box, Typography, Paper, Link, alpha, InputAdornment, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';
import SmartToyIcon from '@mui/icons-material/SmartToy';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const result = await login(username, password);
    if (result.success) {
      navigate('/');
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Animated background circles */}
      <Box
        sx={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: alpha('#fff', 0.1),
          top: '-100px',
          right: '-100px',
          animation: 'float 6s ease-in-out infinite'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: alpha('#fff', 0.1),
          bottom: '-50px',
          left: '-50px',
          animation: 'float 8s ease-in-out infinite 2s'
        }}
      />

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
        `}
      </style>

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper
          elevation={24}
          sx={{
            p: 5,
            background: alpha('#ffffff', 0.15),
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha('#ffffff', 0.2)}`,
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}
        >
          {/* Logo and Title */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <SmartToyIcon sx={{ fontSize: 60, color: '#fff', mb: 2 }} />
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 900,
                background: 'linear-gradient(45deg, #FFF 30%, #FFD700 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Welcome Back
            </Typography>
            <Typography variant="body1" sx={{ color: alpha('#fff', 0.9) }}>
              Sign in to continue to IntelliHire
            </Typography>
          </Box>

          {error && (
            <Typography
              color="error"
              sx={{
                mb: 3,
                p: 2,
                background: alpha('#ff1744', 0.2),
                borderRadius: 2,
                border: `1px solid ${alpha('#ff1744', 0.3)}`,
                textAlign: 'center',
                fontWeight: 600
              }}
            >
              {error}
            </Typography>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username or Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  background: alpha('#fff', 0.1),
                  backdropFilter: 'blur(10px)',
                  color: '#fff',
                  '& fieldset': {
                    borderColor: alpha('#fff', 0.3),
                  },
                  '&:hover fieldset': {
                    borderColor: alpha('#fff', 0.5),
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#FFD700',
                  }
                },
                '& .MuiInputLabel-root': {
                  color: alpha('#fff', 0.7),
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#FFD700',
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

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                mb: 4,
                '& .MuiOutlinedInput-root': {
                  background: alpha('#fff', 0.1),
                  backdropFilter: 'blur(10px)',
                  color: '#fff',
                  '& fieldset': {
                    borderColor: alpha('#fff', 0.3),
                  },
                  '&:hover fieldset': {
                    borderColor: alpha('#fff', 0.5),
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#FFD700',
                  }
                },
                '& .MuiInputLabel-root': {
                  color: alpha('#fff', 0.7),
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#FFD700',
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
                      sx={{ color: alpha('#fff', 0.7) }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              variant="contained"
              type="submit"
              fullWidth
              size="large"
              startIcon={<LoginIcon />}
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 700,
                background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                boxShadow: '0 5px 25px rgba(254, 107, 139, 0.5)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #FF8E53 30%, #FE6B8B 90%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 30px rgba(254, 107, 139, 0.6)',
                },
                transition: 'all 0.3s ease',
                mb: 3
              }}
            >
              Sign In
            </Button>

            <Box
              sx={{
                textAlign: 'center',
                p: 2,
                background: alpha('#fff', 0.1),
                borderRadius: 2,
                border: `1px solid ${alpha('#fff', 0.2)}`
              }}
            >
              <Typography variant="body2" sx={{ color: alpha('#fff', 0.9) }}>
                Don't have an account?{' '}
                <Link
                  href="/register"
                  underline="hover"
                  sx={{
                    color: '#FFD700',
                    fontWeight: 700,
                    '&:hover': {
                      color: '#FFA500'
                    }
                  }}
                >
                  Register Now
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
