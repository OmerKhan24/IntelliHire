import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Assessment as ReportIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  SmartToy as BotIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const InterviewDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedJobDetails, setSelectedJobDetails] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await api.jobs.list();
      setJobs(response.data.jobs || []);
    } catch (err) {
      setError('Failed to load jobs: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (jobId) => {
    try {
      const response = await api.jobs.get(jobId);
      setSelectedJobDetails(response.data.job);
      setDetailsOpen(true);
    } catch (err) {
      setError('Failed to load job details: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleViewReport = (jobId) => {
    navigate(`/report/${jobId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'pending':
        return 'default';
      default:
        return 'default';
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

  const calculateAverageScore = (interviews) => {
    if (!interviews || interviews.length === 0) return 0;
    const completedInterviews = interviews.filter(i => i.status === 'completed' && i.final_score);
    if (completedInterviews.length === 0) return 0;
    const sum = completedInterviews.reduce((acc, i) => acc + i.final_score, 0);
    return (sum / completedInterviews.length).toFixed(1);
  };

  const getJobStats = (job) => {
    const interviews = job.interviews || [];
    return {
      total: interviews.length,
      completed: interviews.filter(i => i.status === 'completed').length,
      inProgress: interviews.filter(i => i.status === 'in_progress').length,
      pending: interviews.filter(i => i.status === 'pending').length,
      averageScore: calculateAverageScore(interviews)
    };
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #F9FAFB 0%, #E5E7EB 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '300px',
          background: 'linear-gradient(135deg, #0A192F 0%, #1E3A5F 50%, #0891B2 100%)',
          zIndex: 0,
        }
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ py: 4 }}>
          {/* Header Section */}
          <Box 
            className="glass-card-white"
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 4,
              p: 3,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
            }}
          >
            <Box>
              <Typography 
                variant="h3" 
                component="h1" 
                gutterBottom
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #0A192F 0%, #0891B2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5,
                }}
              >
                HR Dashboard
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
                Manage interviews, candidates, and company operations
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/create-job')}
                size="large"
                sx={{
                  background: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
                  px: 3,
                  py: 1.5,
                  borderRadius: 3,
                  boxShadow: '0 8px 20px rgba(13, 148, 136, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 28px rgba(13, 148, 136, 0.4)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Create Job
              </Button>
              <Button
                variant="outlined"
                startIcon={<BotIcon />}
                onClick={() => navigate('/hr-assistant')}
                size="large"
                sx={{
                  px: 3,
                  py: 1.5,
                  borderRadius: 3,
                  borderWidth: 2,
                  borderColor: '#0891B2',
                  color: '#0891B2',
                  fontWeight: 600,
                  '&:hover': {
                    borderWidth: 2,
                    borderColor: '#0E7490',
                    background: 'rgba(8, 145, 178, 0.05)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                HR Assistant
              </Button>
            </Box>
          </Box>

          {error && (
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
          )}

          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                className="hover-lift"
                sx={{
                  background: 'linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)',
                  color: 'white',
                  borderRadius: 4,
                  border: 'none',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>
                        {jobs.length}
                      </Typography>
                      <Typography sx={{ opacity: 0.9, fontWeight: 500 }}>Total Jobs</Typography>
                    </Box>
                    <WorkIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card
                className="hover-lift"
                sx={{
                  background: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
                  color: 'white',
                  borderRadius: 4,
                  border: 'none',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>
                        {jobs.reduce((sum, job) => sum + (job.interviews?.length || 0), 0)}
                      </Typography>
                      <Typography sx={{ opacity: 0.9, fontWeight: 500 }}>Total Candidates</Typography>
                    </Box>
                    <PersonIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          
            <Grid item xs={12} sm={6} md={3}>
              <Card
                className="hover-lift"
                sx={{
                  background: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
                  color: 'white',
                  borderRadius: 4,
                  border: 'none',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>
                        {jobs.reduce((sum, job) => sum + (job.interviews?.filter(i => i.status === 'completed').length || 0), 0)}
                      </Typography>
                      <Typography sx={{ opacity: 0.9, fontWeight: 500 }}>Completed</Typography>
                    </Box>
                    <ScheduleIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card
                className="hover-lift"
                sx={{
                  background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
                  color: 'white',
                  borderRadius: 4,
                  border: 'none',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>
                        {(jobs.reduce((sum, job) => {
                          const avg = calculateAverageScore(job.interviews);
                          return avg > 0 ? sum + parseFloat(avg) : sum;
                        }, 0) / jobs.filter(job => calculateAverageScore(job.interviews) > 0).length || 0).toFixed(1)}
                      </Typography>
                      <Typography sx={{ opacity: 0.9, fontWeight: 500 }}>Avg Score</Typography>
                    </Box>
                    <StarIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Jobs Table */}
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #0A192F 0%, #0891B2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Active Job Postings
                </Typography>
                <Chip 
                  label={`${jobs.length} Jobs`} 
                  sx={{ 
                    background: 'linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)',
                    color: 'white',
                    fontWeight: 600,
                    px: 1,
                  }}
                />
              </Box>
              
              {jobs.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary" gutterBottom>
                    No interview jobs created yet
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={() => navigate('/create-job')}
                    sx={{ mt: 2 }}
                  >
                    Create Your First Job
                  </Button>
                </Box>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Job Title</TableCell>
                        <TableCell>Created By</TableCell>
                        <TableCell>Created Date</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell>Candidates</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Avg Score</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {jobs.map((job) => {
                        const stats = getJobStats(job);
                        return (
                          <TableRow key={job.id}>
                            <TableCell>
                              <Typography variant="subtitle2">{job.title}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {job.description.substring(0, 50)}...
                              </Typography>
                            </TableCell>
                            <TableCell>{job.created_by}</TableCell>
                            <TableCell>{formatDate(job.created_at)}</TableCell>
                            <TableCell>{job.duration_minutes} min</TableCell>
                            <TableCell>
                              <Box>
                                <Typography variant="body2">
                                  {stats.total} total
                                </Typography>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}
                                  sx={{ mt: 0.5 }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {stats.completed} completed
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={stats.inProgress > 0 ? 'Active' : stats.completed > 0 ? 'Complete' : 'Waiting'}
                                color={getStatusColor(stats.inProgress > 0 ? 'in_progress' : stats.completed > 0 ? 'completed' : 'pending')}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <StarIcon fontSize="small" color="warning" sx={{ mr: 0.5 }} />
                                {stats.averageScore}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                startIcon={<ViewIcon />}
                                onClick={() => handleViewDetails(job.id)}
                                sx={{ mr: 1 }}
                              >
                                View
                              </Button>
                              <Button
                                size="small"
                                startIcon={<ReportIcon />}
                                onClick={() => handleViewReport(job.id)}
                                variant="outlined"
                              >
                                Report
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Job Details Dialog */}
        <Dialog 
          open={detailsOpen} 
          onClose={() => setDetailsOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Job Details</DialogTitle>
          <DialogContent>
            {selectedJobDetails && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  {selectedJobDetails.title}
                </Typography>
                
                <Typography variant="body1" paragraph>
                  <strong>Description:</strong> {selectedJobDetails.description}
                </Typography>
                
                {selectedJobDetails.requirements && (
                  <Typography variant="body1" paragraph>
                    <strong>Requirements:</strong> {selectedJobDetails.requirements}
                  </Typography>
                )}
                
                <Typography variant="body1" paragraph>
                  <strong>Duration:</strong> {selectedJobDetails.duration_minutes} minutes
                </Typography>
                
                <Typography variant="body1" paragraph>
                  <strong>Interview Link:</strong>
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.100', mb: 2 }}>
                  <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                    {window.location.origin}/interview/{selectedJobDetails.id}
                  </Typography>
                  <Button 
                    size="small" 
                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/interview/${selectedJobDetails.id}`)}
                    sx={{ mt: 1 }}
                  >
                    Copy Link
                  </Button>
                </Paper>
                
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Scoring Criteria
                </Typography>
                {Object.entries(selectedJobDetails.scoring_criteria || {}).map(([key, criteria]) => (
                  <Box key={key} sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      <strong>{key.replace('_', ' ').toUpperCase()}:</strong> {criteria.weight * 100}% - {criteria.description}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default InterviewDashboard;