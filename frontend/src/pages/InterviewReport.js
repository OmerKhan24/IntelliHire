import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Button,
  Tabs,
  Tab,
  LinearProgress,
  Avatar,
  Divider
} from '@mui/material';
import {
  Person as PersonIcon,
  Star as StarIcon,
  Timer as TimerIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const InterviewReport = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  const [job, setJob] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    loadJobReport();
  }, [jobId]);

  const loadJobReport = async () => {
    try {
      setLoading(true);
      const [jobResponse, reportResponse] = await Promise.all([
        api.jobs.get(jobId),
        api.reports.getJob(jobId)
      ]);
      
      setJob(jobResponse.data.job);
      setInterviews(reportResponse.data.interviews || []);
      
      // Select first completed interview by default
      const completedInterviews = reportResponse.data.interviews?.filter(i => i.status === 'completed') || [];
      if (completedInterviews.length > 0) {
        setSelectedInterview(completedInterviews[0]);
      }
      
    } catch (err) {
      setError('Failed to load report: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getScoreGrade = (score) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateOverallStats = () => {
    const completed = interviews.filter(i => i.status === 'completed');
    if (completed.length === 0) return null;

    const scores = completed.map(i => i.final_score || 0);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);

    return {
      avgScore: avgScore.toFixed(1),
      maxScore: maxScore.toFixed(1),
      minScore: minScore.toFixed(1),
      totalCompleted: completed.length,
      totalStarted: interviews.length
    };
  };

  const downloadReport = async () => {
    try {
      const response = await api.reports.downloadReport(jobId);
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `interview-report-${job?.title || 'job'}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download report: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0A192F 0%, #1E3A5F 50%, #0A192F 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress 
            size={60} 
            sx={{ 
              color: '#0891B2',
              mb: 2
            }} 
          />
          <Typography sx={{ color: '#fff', fontSize: '1.1rem' }}>
            Loading report...
          </Typography>
        </Box>
      </Box>
    );
  }

  const stats = calculateOverallStats();
  
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0A192F 0%, #1E3A5F 50%, #0A192F 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(8, 145, 178, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(13, 148, 136, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }
      }}
    >
    <Container maxWidth="lg">
      <Box sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Card 
          sx={{ 
            mb: 4,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.1) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom
              sx={{
                color: '#fff',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #0891B2 0%, #0D9488 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2
              }}
            >
              📊 Interview Report
            </Typography>
            
            {job && (
              <Box>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    color: '#fff',
                    fontWeight: 600,
                    mb: 1
                  }}
                >
                  {job.title}
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.7)'
                  }}
                >
                  Created by {job.created_by} • {formatDate(job.created_at)}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Overall Statistics */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                className="hover-lift"
                sx={{ 
                  background: 'linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)',
                  color: '#fff',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(8, 145, 178, 0.3)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.15)',
                    animation: 'float 6s ease-in-out infinite'
                  }
                }}>
                <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                        {stats.totalCompleted}
                      </Typography>
                      <Typography sx={{ opacity: 0.9, fontWeight: 600 }}>
                        Completed
                      </Typography>
                    </Box>
                    <PersonIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                className="hover-lift"
                sx={{ 
                  background: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
                  color: '#fff',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(13, 148, 136, 0.3)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    bottom: -50,
                    left: -50,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.15)',
                    animation: 'float 7s ease-in-out infinite'
                  }
                }}>
                <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                        {stats.avgScore}
                      </Typography>
                      <Typography sx={{ opacity: 0.9, fontWeight: 600 }}>
                        Average Score
                      </Typography>
                    </Box>
                    <StarIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                className="hover-lift"
                sx={{ 
                  background: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
                  color: '#fff',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(217, 119, 6, 0.3)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.15)',
                    animation: 'float 5s ease-in-out infinite'
                  }
                }}>
                <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                        {stats.maxScore}
                      </Typography>
                      <Typography sx={{ opacity: 0.9, fontWeight: 600 }}>
                        Highest Score
                      </Typography>
                    </Box>
                    <CheckIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                className="hover-lift"
                sx={{ 
                  background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
                  color: '#fff',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(30, 64, 175, 0.3)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    bottom: -50,
                    left: -50,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.15)',
                    animation: 'float 8s ease-in-out infinite'
                  }
                }}>
                <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                        {((stats.totalCompleted / stats.totalStarted) * 100).toFixed(0)}%
                      </Typography>
                      <Typography sx={{ opacity: 0.9, fontWeight: 600 }}>
                        Completion Rate
                      </Typography>
                    </Box>
                    <AssessmentIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Candidate List */}
          <Grid item xs={12} md={4}>
            <Card sx={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.08) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography 
                    variant="h6"
                    sx={{ 
                      color: '#fff',
                      fontWeight: 700
                    }}
                  >
                    Candidates ({interviews.length})
                  </Typography>
                  <Button
                    startIcon={<DownloadIcon />}
                    onClick={downloadReport}
                    size="small"
                    sx={{
                      background: 'linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)',
                      color: '#fff',
                      fontWeight: 600,
                      textTransform: 'none',
                      px: 2,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 15px rgba(8, 145, 178, 0.3)'
                      }
                    }}
                  >
                    Export
                  </Button>
                </Box>
                
                {interviews.length === 0 ? (
                  <Box 
                    sx={{ 
                      textAlign: 'center',
                      py: 6,
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: 2,
                      border: '1px dashed rgba(255,255,255,0.2)'
                    }}
                  >
                    <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>
                      No interviews completed yet
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    {interviews.map((interview) => (
                      <Paper
                        key={interview.id}
                        className="hover-lift"
                        sx={{
                          p: 2.5,
                          mb: 2,
                          cursor: 'pointer',
                          background: selectedInterview?.id === interview.id 
                            ? 'linear-gradient(135deg, rgba(8, 145, 178, 0.2) 0%, rgba(13, 148, 136, 0.2) 100%)'
                            : 'rgba(255,255,255,0.08)',
                          backdropFilter: 'blur(10px)',
                          border: selectedInterview?.id === interview.id 
                            ? '2px solid #0891B2'
                            : '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'linear-gradient(135deg, rgba(8, 145, 178, 0.15) 0%, rgba(13, 148, 136, 0.15) 100%)',
                            borderColor: 'rgba(8, 145, 178, 0.5)'
                          }
                        }}
                        onClick={() => setSelectedInterview(interview)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar 
                            sx={{ 
                              mr: 2,
                              width: 40,
                              height: 40,
                              background: 'linear-gradient(135deg, #0891B2 0%, #0D9488 100%)',
                              fontWeight: 700
                            }}
                          >
                            {interview.candidate_name.charAt(0)}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography 
                              variant="subtitle1"
                              sx={{ 
                                color: '#fff',
                                fontWeight: 600
                              }}
                            >
                              {interview.candidate_name}
                            </Typography>
                            <Typography 
                              variant="body2"
                              sx={{ 
                                color: 'rgba(255,255,255,0.7)',
                                fontSize: '0.85rem'
                              }}
                            >
                              {interview.candidate_email}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Chip
                            label={interview.status.toUpperCase()}
                            size="small"
                            sx={{
                              background: interview.status === 'completed'
                                ? 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)'
                                : interview.status === 'in_progress'
                                ? 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)'
                                : 'rgba(100, 116, 139, 0.3)',
                              color: '#fff',
                              fontWeight: 600,
                              border: '1px solid rgba(255,255,255,0.2)'
                            }}
                          />
                          {interview.final_score && (
                            <Chip
                              label={`${interview.final_score.toFixed(1)}% (${getScoreGrade(interview.final_score)})`}
                              size="small"
                              sx={{
                                background: interview.final_score >= 80
                                  ? 'linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)'
                                  : interview.final_score >= 60
                                  ? 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)'
                                  : 'rgba(239, 68, 68, 0.8)',
                                color: '#fff',
                                fontWeight: 700,
                                border: '1px solid rgba(255,255,255,0.2)'
                              }}
                            />
                          )}
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Detailed Report */}
          <Grid item xs={12} md={8}>
            {selectedInterview ? (
              <Card sx={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.08) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }}>
                <CardContent>
                  <Box 
                    sx={{ 
                      borderBottom: '2px solid rgba(8, 145, 178, 0.3)',
                      mb: 3 
                    }}
                  >
                    <Tabs 
                      value={tabValue} 
                      onChange={(e, v) => setTabValue(v)}
                      sx={{
                        '& .MuiTab-root': {
                          color: 'rgba(255,255,255,0.6)',
                          fontWeight: 600,
                          '&.Mui-selected': {
                            color: '#0891B2'
                          }
                        },
                        '& .MuiTabs-indicator': {
                          backgroundColor: '#0891B2',
                          height: 3
                        }
                      }}
                    >
                      <Tab label="Overview" />
                      <Tab label="Responses" />
                      <Tab label="AI Analysis" />
                    </Tabs>
                  </Box>

                  {/* Overview Tab */}
                  {tabValue === 0 && (
                    <Box>
                      <Typography 
                        variant="h4" 
                        gutterBottom
                        sx={{
                          color: '#fff',
                          fontWeight: 700,
                          mb: 3
                        }}
                      >
                        {selectedInterview.candidate_name}
                      </Typography>
                      
                      <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6}>
                          <Box 
                            sx={{ 
                              p: 2,
                              background: 'rgba(255,255,255,0.05)',
                              borderRadius: 2,
                              border: '1px solid rgba(255,255,255,0.1)'
                            }}
                          >
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: 'rgba(255,255,255,0.6)',
                                mb: 0.5,
                                fontWeight: 600
                              }}
                            >
                              Email
                            </Typography>
                            <Typography sx={{ color: '#fff' }}>
                              {selectedInterview.candidate_email}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box 
                            sx={{ 
                              p: 2,
                              background: 'rgba(255,255,255,0.05)',
                              borderRadius: 2,
                              border: '1px solid rgba(255,255,255,0.1)'
                            }}
                          >
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: 'rgba(255,255,255,0.6)',
                                mb: 0.5,
                                fontWeight: 600
                              }}
                            >
                              Phone
                            </Typography>
                            <Typography sx={{ color: '#fff' }}>
                              {selectedInterview.candidate_phone || 'Not provided'}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box 
                            sx={{ 
                              p: 2,
                              background: 'rgba(255,255,255,0.05)',
                              borderRadius: 2,
                              border: '1px solid rgba(255,255,255,0.1)'
                            }}
                          >
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: 'rgba(255,255,255,0.6)',
                                mb: 0.5,
                                fontWeight: 600
                              }}
                            >
                              Interview Date
                            </Typography>
                            <Typography sx={{ color: '#fff' }}>
                              {formatDate(selectedInterview.started_at)}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box 
                            sx={{ 
                              p: 2,
                              background: 'rgba(255,255,255,0.05)',
                              borderRadius: 2,
                              border: '1px solid rgba(255,255,255,0.1)'
                            }}
                          >
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: 'rgba(255,255,255,0.6)',
                                mb: 0.5,
                                fontWeight: 600
                              }}
                            >
                              Duration
                            </Typography>
                          <Typography>
                            {selectedInterview.completed_at ? 
                              Math.round((new Date(selectedInterview.completed_at) - new Date(selectedInterview.started_at)) / 60000) + ' minutes' :
                              'In progress'
                            }
                          </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      {selectedInterview.final_score && (
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="h6" gutterBottom>
                            Overall Score
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ flexGrow: 1, mr: 2 }}>
                              <LinearProgress
                                variant="determinate"
                                value={selectedInterview.final_score}
                                color={getScoreColor(selectedInterview.final_score)}
                                sx={{ height: 10, borderRadius: 5 }}
                              />
                            </Box>
                            <Typography variant="h6" sx={{ minWidth: 80 }}>
                              {selectedInterview.final_score.toFixed(1)}%
                            </Typography>
                            <Chip
                              label={getScoreGrade(selectedInterview.final_score)}
                              color={getScoreColor(selectedInterview.final_score)}
                              sx={{ ml: 1 }}
                            />
                          </Box>
                        </Box>
                      )}

                      {selectedInterview.ai_analysis && (
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            Score Breakdown
                          </Typography>
                          <Grid container spacing={2}>
                            {Object.entries(selectedInterview.ai_analysis.scores || {}).map(([category, score]) => (
                              <Grid item xs={12} sm={6} key={category}>
                                <Paper sx={{ p: 2 }}>
                                  <Typography variant="subtitle2" sx={{ mb: 1, textTransform: 'capitalize' }}>
                                    {category.replace('_', ' ')}
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <LinearProgress
                                      variant="determinate"
                                      value={score}
                                      sx={{ flexGrow: 1, mr: 2, height: 6 }}
                                    />
                                    <Typography variant="body2">
                                      {score.toFixed(1)}%
                                    </Typography>
                                  </Box>
                                </Paper>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}

                      {/* CV Monitoring Report */}
                      {selectedInterview.cv_monitoring_report && selectedInterview.cv_monitoring_report.success && (
                        <Box sx={{ mt: 3 }}>
                          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <WarningIcon /> CV Monitoring Report
                          </Typography>
                          
                          {/* Monitoring Summary Stats */}
                          <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={6} sm={3}>
                              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.default' }}>
                                <Typography variant="h4" color={
                                  selectedInterview.cv_monitoring_report.risk_level === 'low' ? 'success.main' :
                                  selectedInterview.cv_monitoring_report.risk_level === 'medium' ? 'warning.main' :
                                  selectedInterview.cv_monitoring_report.risk_level === 'high' ? 'error.main' : 'error.dark'
                                }>
                                  {(selectedInterview.cv_monitoring_report.final_risk_score * 100).toFixed(1)}%
                                </Typography>
                                <Typography variant="caption" color="text.secondary">Risk Score</Typography>
                              </Paper>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.default' }}>
                                <Typography variant="h4">
                                  {selectedInterview.cv_monitoring_report.total_warnings || 0}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">Total Warnings</Typography>
                              </Paper>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.default' }}>
                                <Typography variant="h4">
                                  {selectedInterview.cv_monitoring_report.total_frames_analyzed || 0}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">Frames Analyzed</Typography>
                              </Paper>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.default' }}>
                                <Chip 
                                  label={selectedInterview.cv_monitoring_report.risk_level?.toUpperCase() || 'N/A'} 
                                  color={
                                    selectedInterview.cv_monitoring_report.risk_level === 'low' ? 'success' :
                                    selectedInterview.cv_monitoring_report.risk_level === 'medium' ? 'warning' :
                                    selectedInterview.cv_monitoring_report.risk_level === 'high' ? 'error' : 'error'
                                  }
                                  sx={{ mt: 1 }}
                                />
                                <Typography variant="caption" color="text.secondary" display="block">Risk Level</Typography>
                              </Paper>
                            </Grid>
                          </Grid>

                          {/* Detection Breakdown */}
                          {selectedInterview.cv_monitoring_report.detection_breakdown && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle1" gutterBottom>Detection Breakdown</Typography>
                              <Grid container spacing={1}>
                                {Object.entries(selectedInterview.cv_monitoring_report.detection_breakdown).map(([type, count]) => (
                                  <Grid item xs={6} sm={4} key={type}>
                                    <Paper sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between' }}>
                                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                        {type.replace('_', ' ')}
                                      </Typography>
                                      <Chip label={count} size="small" />
                                    </Paper>
                                  </Grid>
                                ))}
                              </Grid>
                            </Box>
                          )}

                          {/* Alert Level Breakdown */}
                          {selectedInterview.cv_monitoring_report.alert_level_breakdown && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle1" gutterBottom>Alert Severity</Typography>
                              <Grid container spacing={1}>
                                {Object.entries(selectedInterview.cv_monitoring_report.alert_level_breakdown).map(([level, count]) => (
                                  <Grid item xs={6} sm={3} key={level}>
                                    <Paper sx={{ 
                                      p: 1.5, 
                                      bgcolor: level === 'critical' ? 'error.lighter' : 
                                              level === 'high' ? 'warning.lighter' : 
                                              level === 'medium' ? 'info.lighter' : 'success.lighter',
                                      textAlign: 'center'
                                    }}>
                                      <Typography variant="h5">{count}</Typography>
                                      <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>{level}</Typography>
                                    </Paper>
                                  </Grid>
                                ))}
                              </Grid>
                            </Box>
                          )}

                          {/* Critical Events */}
                          {selectedInterview.cv_monitoring_report.critical_events && 
                           selectedInterview.cv_monitoring_report.critical_events.length > 0 && (
                            <Box>
                              <Typography variant="subtitle1" gutterBottom color="error" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <WarningIcon /> Critical Alert Screenshots ({selectedInterview.cv_monitoring_report.critical_events.length})
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                The following screenshots were captured when critical alerts were detected during the interview:
                              </Typography>
                              <Grid container spacing={2}>
                                {selectedInterview.cv_monitoring_report.critical_events.map((event, idx) => (
                                  <Grid item xs={12} md={6} key={idx}>
                                    <Card sx={{ 
                                      border: '2px solid',
                                      borderColor: event.alert_level === 'critical' ? 'error.main' : 'warning.main',
                                      bgcolor: event.alert_level === 'critical' ? 'error.lighter' : 'warning.lighter'
                                    }}>
                                      <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                                            {event.type?.replace('_', ' ')}
                                          </Typography>
                                          <Chip 
                                            label={event.alert_level?.toUpperCase() || 'ALERT'} 
                                            size="small"
                                            color={event.alert_level === 'critical' ? 'error' : 'warning'}
                                          />
                                        </Box>
                                        
                                        {event.message && (
                                          <Typography variant="body2" sx={{ mb: 1 }}>
                                            {event.message}
                                          </Typography>
                                        )}
                                        
                                        {event.timestamp && (
                                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                                            📅 {new Date(event.timestamp * 1000 || event.timestamp).toLocaleString()}
                                          </Typography>
                                        )}
                                        
                                        {event.details && (
                                          <Box sx={{ mb: 2 }}>
                                            {event.details.message && (
                                              <Typography variant="caption" display="block">
                                                ℹ️ {event.details.message}
                                              </Typography>
                                            )}
                                            {event.details.count !== undefined && (
                                              <Typography variant="caption" display="block">
                                                Count: {event.details.count}
                                              </Typography>
                                            )}
                                          </Box>
                                        )}
                                        
                                        {event.screenshot && (
                                          <Box sx={{ 
                                            mt: 2, 
                                            p: 1, 
                                            bgcolor: 'background.paper',
                                            borderRadius: 1,
                                            textAlign: 'center'
                                          }}>
                                            <img 
                                              src={`http://localhost:5000/api/monitoring/screenshots/${event.screenshot.split('/').pop()}`}
                                              alt={`${event.type} detection at ${new Date(event.timestamp * 1000 || event.timestamp).toLocaleTimeString()}`}
                                              style={{ 
                                                maxWidth: '100%', 
                                                height: 'auto',
                                                maxHeight: '250px',
                                                borderRadius: '4px',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                              }}
                                              onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'block';
                                              }}
                                            />
                                            <Typography 
                                              variant="caption" 
                                              color="error" 
                                              sx={{ display: 'none', mt: 1 }}
                                            >
                                              Screenshot not available
                                            </Typography>
                                          </Box>
                                        )}
                                      </CardContent>
                                    </Card>
                                  </Grid>
                                ))}
                              </Grid>
                            </Box>
                          )}
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* Responses Tab */}
                  {tabValue === 1 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Interview Responses
                      </Typography>
                      
                      {selectedInterview.responses && selectedInterview.responses.length > 0 ? (
                        selectedInterview.responses.map((response, index) => (
                          <Paper key={response.id || index} sx={{ p: 3, mb: 2 }}>
                            <Typography variant="h6" gutterBottom color="primary">
                              Question {index + 1}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2, fontWeight: 'bold' }}>
                              {response.question_text}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 2, bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                              {response.answer_text}
                            </Typography>
                            
                            {/* Voice Analysis Section */}
                            {response.voice_analysis_data && !response.voice_analysis_data.error && (
                              <Box sx={{ mt: 2, p: 2, bgcolor: 'info.lighter', borderRadius: 1, border: '1px solid', borderColor: 'info.light' }}>
                                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  🎤 Voice Analysis
                                </Typography>
                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                  <Grid item xs={6} sm={3}>
                                    <Typography variant="caption" color="text.secondary">Speaking Pace</Typography>
                                    <Typography variant="body2" fontWeight="bold">
                                      {response.voice_analysis_data.speaking_pace} WPM
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={6} sm={3}>
                                    <Typography variant="caption" color="text.secondary">Clarity Score</Typography>
                                    <Typography variant="body2" fontWeight="bold">
                                      {response.voice_analysis_data.clarity_score}/100
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={6} sm={3}>
                                    <Typography variant="caption" color="text.secondary">Confidence</Typography>
                                    <Typography variant="body2" fontWeight="bold">
                                      {response.voice_analysis_data.confidence_score}/100
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={6} sm={3}>
                                    <Typography variant="caption" color="text.secondary">Filler Words</Typography>
                                    <Typography variant="body2" fontWeight="bold">
                                      {response.voice_analysis_data.filler_word_count}
                                    </Typography>
                                  </Grid>
                                </Grid>
                                {response.voice_analysis_data.analysis_summary && (
                                  <Typography variant="caption" sx={{ mt: 2, display: 'block', fontStyle: 'italic' }}>
                                    {response.voice_analysis_data.analysis_summary}
                                  </Typography>
                                )}
                              </Box>
                            )}
                            
                            {response.ai_feedback && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                  AI Feedback:
                                </Typography>
                                <Typography variant="body2">
                                  {response.ai_feedback}
                                </Typography>
                              </Box>
                            )}
                            {response.score && (
                              <Chip
                                label={`Score: ${response.score.toFixed(1)}%`}
                                color={getScoreColor(response.score)}
                                size="small"
                                sx={{ mt: 1 }}
                              />
                            )}
                          </Paper>
                        ))
                      ) : (
                        <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                          No responses available
                        </Typography>
                      )}
                    </Box>
                  )}

                  {/* AI Analysis Tab */}
                  {tabValue === 2 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        AI Analysis Report
                      </Typography>
                      
                      {selectedInterview.ai_analysis ? (
                        <Box>
                          {/* Overall Assessment */}
                          {selectedInterview.ai_analysis.overall_assessment && (
                            <Paper sx={{ p: 3, mb: 3 }}>
                              <Typography variant="h6" gutterBottom>
                                Overall Assessment
                              </Typography>
                              <Typography variant="body1">
                                {selectedInterview.ai_analysis.overall_assessment}
                              </Typography>
                            </Paper>
                          )}

                          {/* Strengths and Weaknesses */}
                          <Grid container spacing={2} sx={{ mb: 3 }}>
                            {selectedInterview.ai_analysis.strengths && (
                              <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 2 }}>
                                  <Typography variant="h6" gutterBottom color="success.main">
                                    Strengths
                                  </Typography>
                                  {selectedInterview.ai_analysis.strengths.map((strength, index) => (
                                    <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                                      • {strength}
                                    </Typography>
                                  ))}
                                </Paper>
                              </Grid>
                            )}
                            
                            {selectedInterview.ai_analysis.weaknesses && (
                              <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 2 }}>
                                  <Typography variant="h6" gutterBottom color="warning.main">
                                    Areas for Improvement
                                  </Typography>
                                  {selectedInterview.ai_analysis.weaknesses.map((weakness, index) => (
                                    <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                                      • {weakness}
                                    </Typography>
                                  ))}
                                </Paper>
                              </Grid>
                            )}
                          </Grid>

                          {/* Recommendation */}
                          {selectedInterview.ai_analysis.recommendation && (
                            <Paper sx={{ p: 3 }}>
                              <Typography variant="h6" gutterBottom>
                                Recommendation
                              </Typography>
                              <Typography variant="body1">
                                {selectedInterview.ai_analysis.recommendation}
                              </Typography>
                            </Paper>
                          )}

                          {/* Warning Flags */}
                          {selectedInterview.warnings && selectedInterview.warnings.length > 0 && (
                            <Paper sx={{ p: 3, mt: 3 }}>
                              <Typography variant="h6" gutterBottom color="warning.main">
                                <WarningIcon sx={{ mr: 1 }} />
                                Behavioral Warnings
                              </Typography>
                              {selectedInterview.warnings.map((warning, index) => (
                                <Chip
                                  key={index}
                                  label={warning.message}
                                  color="warning"
                                  size="small"
                                  sx={{ mr: 1, mb: 1 }}
                                />
                              ))}
                            </Paper>
                          )}
                        </Box>
                      ) : (
                        <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                          AI analysis not available for this interview
                        </Typography>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent>
                  <Typography color="text.secondary" align="center" sx={{ py: 8 }}>
                    Select a candidate to view detailed report
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Box>
    </Container>
    </Box>
  );
};

export default InterviewReport;