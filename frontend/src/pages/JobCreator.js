import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  alpha,
  Fade,
  Zoom,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
import { api } from '../services/api';
import WorkIcon from '@mui/icons-material/Work';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import BackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';

const JobCreator = () => {
  const navigate = useNavigate();
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    requirements: '',
    duration_minutes: 20,
    created_by: '',
    scoring_criteria: {
      technical_skills: { weight: 0.4, description: 'Technical knowledge and problem-solving' },
      communication: { weight: 0.3, description: 'Communication clarity and confidence' },
      behavioral: { weight: 0.2, description: 'Team fit and professional behavior' },
      experience: { weight: 0.1, description: 'Relevant experience and background' }
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [interviewLink, setInterviewLink] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setJobData(prev => ({
      ...prev,
      [name]: name === 'duration_minutes' ? parseInt(value) || 20 : value
    }));
  };

  const handleScoringChange = (criterion, field, value) => {
    setJobData(prev => ({
      ...prev,
      scoring_criteria: {
        ...prev.scoring_criteria,
        [criterion]: {
          ...prev.scoring_criteria[criterion],
          [field]: field === 'weight' ? parseFloat(value) || 0 : value
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Validate required fields
      if (!jobData.title || !jobData.description || !jobData.created_by) {
        throw new Error('Please fill in all required fields');
      }

      // Validate scoring weights sum to 1
      const totalWeight = Object.values(jobData.scoring_criteria).reduce(
        (sum, criteria) => sum + (criteria.weight || 0), 0
      );
      
      if (Math.abs(totalWeight - 1.0) > 0.01) {
        throw new Error('Scoring criteria weights must sum to 1.0');
      }

      const response = await api.jobs.create(jobData);
      
      setSuccess(true);
      setInterviewLink(`${window.location.origin}/interview/${response.data.job.id}`);
      
      // Reset form
      setJobData({
        title: '',
        description: '',
        requirements: '',
        duration_minutes: 20,
        created_by: '',
        scoring_criteria: {
          technical_skills: { weight: 0.4, description: 'Technical knowledge and problem-solving' },
          communication: { weight: 0.3, description: 'Communication clarity and confidence' },
          behavioral: { weight: 0.2, description: 'Team fit and professional behavior' },
          experience: { weight: 0.1, description: 'Relevant experience and background' }
        }
      });

    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(interviewLink);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            <BackIcon />
          </IconButton>
          <WorkIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Create Interview Job
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Fade in timeout={600}>
            <Box sx={{ mb: 5, textAlign: 'center' }}>
              <Typography 
                variant="h3" 
                component="h1" 
                gutterBottom
                sx={{
                  fontWeight: 900,
                  color: '#fff',
                  textShadow: '0 4px 20px rgba(0,0,0,0.3)'
                }}
              >
                🎯 Create AI Interview
              </Typography>
              <Typography 
                variant="h6"
                sx={{
                  color: alpha('#fff', 0.9),
                  fontWeight: 300
                }}
              >
                Set up a new AI-powered interview with custom questions and scoring criteria
              </Typography>
            </Box>
          </Fade>

          {success && (
            <Zoom in>
              <Alert 
                severity="success" 
                icon={<CheckCircleIcon fontSize="large" />}
                sx={{ 
                  mb: 4,
                  background: alpha('#4caf50', 0.2),
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha('#4caf50', 0.4)}`,
                  color: '#fff',
                  '& .MuiAlert-icon': {
                    color: '#4caf50'
                  }
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  🎉 Job created successfully!
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Share the interview link with candidates
                </Typography>
                <Paper sx={{ 
                  p: 2, 
                  background: alpha('#fff', 0.15),
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha('#fff', 0.2)}`
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      wordBreak: 'break-all',
                      color: '#FFD700',
                      fontWeight: 600,
                      mb: 1
                    }}
                  >
                    {interviewLink}
                  </Typography>
                  <Button 
                    size="small" 
                    onClick={copyToClipboard}
                    startIcon={<ContentCopyIcon />}
                    sx={{
                      background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                      color: '#fff',
                      fontWeight: 700,
                      '&:hover': {
                        background: 'linear-gradient(45deg, #FF8E53 30%, #FE6B8B 90%)',
                      }
                    }}
                  >
                    Copy Link
                  </Button>
                </Paper>
              </Alert>
            </Zoom>
          )}

          {error && (
            <Zoom in>
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 4,
                  background: alpha('#f44336', 0.2),
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha('#f44336', 0.4)}`,
                  color: '#fff'
                }} 
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            </Zoom>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              {/* Basic Job Information */}
              <Grid item xs={12} md={8}>
                <Fade in timeout={800}>
                  <Card sx={{
                    background: alpha('#fff', 0.15),
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${alpha('#fff', 0.2)}`,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                  }}>
                    <CardContent sx={{ p: 4 }}>
                      <Box display="flex" alignItems="center" gap={2} mb={3}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                            color: '#fff'
                          }}
                        >
                          <WorkIcon fontSize="large" />
                        </Box>
                        <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>
                          Job Information
                        </Typography>
                      </Box>
                      
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <TextField
                            name="title"
                            label="Job Title"
                            value={jobData.title}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            placeholder="e.g. Senior Software Engineer"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                background: alpha('#fff', 0.1),
                                backdropFilter: 'blur(10px)',
                                color: '#fff',
                                '& fieldset': { borderColor: alpha('#fff', 0.3) },
                                '&:hover fieldset': { borderColor: alpha('#fff', 0.5) },
                                '&.Mui-focused fieldset': { borderColor: '#FFD700', borderWidth: 2 }
                              },
                              '& .MuiInputLabel-root': { 
                                color: alpha('#fff', 0.8),
                                '&.Mui-focused': { color: '#FFD700' }
                              },
                              '& input::placeholder': { color: alpha('#fff', 0.5) }
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12}>
                          <TextField
                            name="description"
                            label="Job Description"
                            value={jobData.description}
                            onChange={handleInputChange}
                            fullWidth
                            multiline
                            rows={4}
                            required
                            placeholder="Describe the role, responsibilities, and key requirements..."
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                background: alpha('#fff', 0.1),
                                backdropFilter: 'blur(10px)',
                                color: '#fff',
                                '& fieldset': { borderColor: alpha('#fff', 0.3) },
                                '&:hover fieldset': { borderColor: alpha('#fff', 0.5) },
                                '&.Mui-focused fieldset': { borderColor: '#FFD700', borderWidth: 2 }
                              },
                              '& .MuiInputLabel-root': { 
                                color: alpha('#fff', 0.8),
                                '&.Mui-focused': { color: '#FFD700' }
                              },
                              '& textarea::placeholder': { color: alpha('#fff', 0.5) }
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12}>
                          <TextField
                            name="requirements"
                            label="Requirements (Optional)"
                            value={jobData.requirements}
                            onChange={handleInputChange}
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Technical skills, experience level, education requirements..."
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                background: alpha('#fff', 0.1),
                                backdropFilter: 'blur(10px)',
                                color: '#fff',
                                '& fieldset': { borderColor: alpha('#fff', 0.3) },
                                '&:hover fieldset': { borderColor: alpha('#fff', 0.5) },
                                '&.Mui-focused fieldset': { borderColor: '#FFD700', borderWidth: 2 }
                              },
                              '& .MuiInputLabel-root': { 
                                color: alpha('#fff', 0.8),
                                '&.Mui-focused': { color: '#FFD700' }
                              },
                              '& textarea::placeholder': { color: alpha('#fff', 0.5) }
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <TextField
                            name="duration_minutes"
                            label="Interview Duration (minutes)"
                            type="number"
                            value={jobData.duration_minutes}
                            onChange={handleInputChange}
                            fullWidth
                            inputProps={{ min: 5, max: 60 }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                background: alpha('#fff', 0.1),
                                backdropFilter: 'blur(10px)',
                                color: '#fff',
                                '& fieldset': { borderColor: alpha('#fff', 0.3) },
                                '&:hover fieldset': { borderColor: alpha('#fff', 0.5) },
                                '&.Mui-focused fieldset': { borderColor: '#FFD700', borderWidth: 2 }
                              },
                              '& .MuiInputLabel-root': { 
                                color: alpha('#fff', 0.8),
                                '&.Mui-focused': { color: '#FFD700' }
                              }
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <TextField
                            name="created_by"
                            label="Interviewer Name/Email"
                            value={jobData.created_by}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            placeholder="your.email@company.com"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                background: alpha('#fff', 0.1),
                                backdropFilter: 'blur(10px)',
                                color: '#fff',
                                '& fieldset': { borderColor: alpha('#fff', 0.3) },
                                '&:hover fieldset': { borderColor: alpha('#fff', 0.5) },
                                '&.Mui-focused fieldset': { borderColor: '#FFD700', borderWidth: 2 }
                              },
                              '& .MuiInputLabel-root': { 
                                color: alpha('#fff', 0.8),
                                '&.Mui-focused': { color: '#FFD700' }
                              },
                              '& input::placeholder': { color: alpha('#fff', 0.5) }
                            }}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>

              {/* Scoring Criteria */}
              <Grid item xs={12} md={4}>
                <Fade in timeout={1000}>
                  <Card sx={{
                    background: alpha('#fff', 0.15),
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${alpha('#fff', 0.2)}`,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    position: 'sticky',
                    top: 90
                  }}>
                    <CardContent sx={{ p: 4 }}>
                      <Box display="flex" alignItems="center" gap={2} mb={3}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #FE6B8B 0%, #FF8E53 100%)',
                            color: '#fff'
                          }}
                        >
                          <AssessmentIcon fontSize="large" />
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
                            Scoring Criteria
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" sx={{ color: alpha('#fff', 0.8), mb: 3 }}>
                        Configure how candidates will be evaluated (weights must sum to 1.0)
                      </Typography>
                      
                      {Object.entries(jobData.scoring_criteria).map(([key, criteria]) => (
                        <Box 
                          key={key} 
                          sx={{ 
                            mb: 3,
                            p: 2,
                            borderRadius: 2,
                            background: alpha('#fff', 0.1),
                            backdropFilter: 'blur(10px)'
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ mb: 1.5, textTransform: 'capitalize', color: '#FFD700', fontWeight: 700 }}>
                            {key.replace('_', ' ')}
                          </Typography>
                          
                          <TextField
                            label="Weight"
                            type="number"
                            value={criteria.weight}
                            onChange={(e) => handleScoringChange(key, 'weight', e.target.value)}
                            size="small"
                            fullWidth
                            sx={{ 
                              mb: 1.5,
                              '& .MuiOutlinedInput-root': {
                                background: alpha('#fff', 0.15),
                                color: '#fff',
                                '& fieldset': { borderColor: alpha('#fff', 0.3) },
                                '&:hover fieldset': { borderColor: alpha('#fff', 0.5) },
                                '&.Mui-focused fieldset': { borderColor: '#FFD700' }
                              },
                              '& .MuiInputLabel-root': { 
                                color: alpha('#fff', 0.8),
                                '&.Mui-focused': { color: '#FFD700' }
                              }
                            }}
                            inputProps={{ min: 0, max: 1, step: 0.1 }}
                          />
                          
                          <TextField
                            label="Description"
                            value={criteria.description}
                            onChange={(e) => handleScoringChange(key, 'description', e.target.value)}
                            fullWidth
                            size="small"
                            multiline
                            rows={2}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                background: alpha('#fff', 0.15),
                                color: '#fff',
                                '& fieldset': { borderColor: alpha('#fff', 0.3) },
                                '&:hover fieldset': { borderColor: alpha('#fff', 0.5) },
                                '&.Mui-focused fieldset': { borderColor: '#FFD700' }
                              },
                              '& .MuiInputLabel-root': { 
                                color: alpha('#fff', 0.8),
                                '&.Mui-focused': { color: '#FFD700' }
                              }
                            }}
                          />
                        </Box>
                      ))}
                      
                      <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Chip 
                          label={`Total Weight: ${Object.values(jobData.scoring_criteria).reduce((sum, c) => sum + c.weight, 0).toFixed(1)}`}
                          sx={{
                            background: Math.abs(Object.values(jobData.scoring_criteria).reduce((sum, c) => sum + c.weight, 0) - 1.0) < 0.01 
                              ? 'linear-gradient(45deg, #4caf50 30%, #8bc34a 90%)'
                              : 'linear-gradient(45deg, #f44336 30%, #ff5252 90%)',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '1rem',
                            py: 2.5
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Zoom in timeout={1200}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading}
                      sx={{ 
                        px: 8, 
                        py: 2,
                        fontSize: '1.2rem',
                        fontWeight: 800,
                        background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                        boxShadow: '0 8px 30px rgba(254, 107, 139, 0.5)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #FF8E53 30%, #FE6B8B 90%)',
                          transform: 'translateY(-5px) scale(1.05)',
                          boxShadow: '0 15px 45px rgba(254, 107, 139, 0.7)',
                        },
                        '&:disabled': {
                          background: alpha('#fff', 0.1),
                          color: alpha('#fff', 0.5)
                        }
                      }}
                    >
                      {loading ? (
                        <>
                          <CircularProgress size={24} sx={{ mr: 2, color: '#fff' }} />
                          Creating Job...
                        </>
                      ) : (
                        '🚀 Create Interview Job'
                      )}
                    </Button>
                  </Box>
                </Zoom>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Container>
    </Box>
  );
};

export default JobCreator;