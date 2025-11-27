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
        api.reports.getJobReport(jobId)
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
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `interview-report-${job?.title || 'job'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('Failed to download report: ' + (err.response?.data?.error || err.message));
    }
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

  const stats = calculateOverallStats();
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Interview Report
          </Typography>
          
          {job && (
            <Box>
              <Typography variant="h6" color="text.secondary">
                {job.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Created by {job.created_by} • {formatDate(job.created_at)}
              </Typography>
            </Box>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Overall Statistics */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon color="primary" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="h4">{stats.totalCompleted}</Typography>
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
                    <StarIcon color="warning" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="h4">{stats.avgScore}</Typography>
                      <Typography color="text.secondary">Average Score</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckIcon color="success" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="h4">{stats.maxScore}</Typography>
                      <Typography color="text.secondary">Highest Score</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AssessmentIcon color="info" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="h4">
                        {((stats.totalCompleted / stats.totalStarted) * 100).toFixed(0)}%
                      </Typography>
                      <Typography color="text.secondary">Completion Rate</Typography>
                    </Box>
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
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Candidates ({interviews.length})
                  </Typography>
                  <Button
                    startIcon={<DownloadIcon />}
                    onClick={downloadReport}
                    size="small"
                  >
                    Export
                  </Button>
                </Box>
                
                {interviews.length === 0 ? (
                  <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                    No interviews completed yet
                  </Typography>
                ) : (
                  <Box>
                    {interviews.map((interview) => (
                      <Paper
                        key={interview.id}
                        sx={{
                          p: 2,
                          mb: 2,
                          cursor: 'pointer',
                          border: selectedInterview?.id === interview.id ? 2 : 1,
                          borderColor: selectedInterview?.id === interview.id ? 'primary.main' : 'divider',
                          '&:hover': {
                            bgcolor: 'action.hover'
                          }
                        }}
                        onClick={() => setSelectedInterview(interview)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar sx={{ mr: 2, width: 40, height: 40 }}>
                            {interview.candidate_name.charAt(0)}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle1">
                              {interview.candidate_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {interview.candidate_email}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Chip
                            label={interview.status}
                            color={interview.status === 'completed' ? 'success' : 
                                   interview.status === 'in_progress' ? 'warning' : 'default'}
                            size="small"
                          />
                          {interview.final_score && (
                            <Chip
                              label={`${interview.final_score.toFixed(1)}% (${getScoreGrade(interview.final_score)})`}
                              color={getScoreColor(interview.final_score)}
                              size="small"
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
              <Card>
                <CardContent>
                  <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                      <Tab label="Overview" />
                      <Tab label="Responses" />
                      <Tab label="AI Analysis" />
                    </Tabs>
                  </Box>

                  {/* Overview Tab */}
                  {tabValue === 0 && (
                    <Box>
                      <Typography variant="h5" gutterBottom>
                        {selectedInterview.candidate_name}
                      </Typography>
                      
                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Email</Typography>
                          <Typography>{selectedInterview.candidate_email}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Phone</Typography>
                          <Typography>{selectedInterview.candidate_phone || 'Not provided'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Interview Date</Typography>
                          <Typography>{formatDate(selectedInterview.started_at)}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Duration</Typography>
                          <Typography>
                            {selectedInterview.completed_at ? 
                              Math.round((new Date(selectedInterview.completed_at) - new Date(selectedInterview.started_at)) / 60000) + ' minutes' :
                              'In progress'
                            }
                          </Typography>
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
  );
};

export default InterviewReport;