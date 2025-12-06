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
  SmartToy as BotIcon
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
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              HR Dashboard
            </Typography>
            <Typography color="text.secondary">
              Manage interviews, employees, and company documents
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<BotIcon />}
            onClick={() => navigate('/hr-assistant')}
            size="large"
          >
            HR Assistant
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <WorkIcon color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{jobs.length}</Typography>
                    <Typography color="text.secondary">Total Jobs</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonIcon color="success" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">
                      {jobs.reduce((sum, job) => sum + (job.interviews?.length || 0), 0)}
                    </Typography>
                    <Typography color="text.secondary">Total Candidates</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ScheduleIcon color="warning" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">
                      {jobs.reduce((sum, job) => sum + (job.interviews?.filter(i => i.status === 'completed').length || 0), 0)}
                    </Typography>
                    <Typography color="text.secondary">Completed</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <StarIcon color="info" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">
                      {jobs.length > 0 
                        ? (jobs.reduce((sum, job) => sum + parseFloat(calculateAverageScore(job.interviews || [])), 0) / jobs.length).toFixed(1)
                        : '0.0'
                      }
                    </Typography>
                    <Typography color="text.secondary">Avg Score</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Jobs Table */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Interview Jobs
            </Typography>
            
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
      </Box>
    </Container>
  );
};

export default InterviewDashboard;