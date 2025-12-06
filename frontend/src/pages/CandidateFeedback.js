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
  LinearProgress,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  TrendingUp as ImprovementIcon,
  School as LearningIcon,
  Star as StarIcon,
  Warning as WarningIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const CandidateFeedback = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [interview, setInterview] = useState(null);

  useEffect(() => {
    loadFeedback();
  }, [interviewId]);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const response = await api.interviews.getFeedback(interviewId);
      setFeedback(response.data.feedback);
      setInterview(response.data.interview);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'success';
    if (score >= 70) return 'info';
    if (score >= 55) return 'warning';
    return 'error';
  };

  const getPerformanceIcon = (level) => {
    switch (level) {
      case 'Excellent': return <TrophyIcon sx={{ fontSize: 60, color: 'gold' }} />;
      case 'Good': return <StarIcon sx={{ fontSize: 60, color: 'primary.main' }} />;
      case 'Fair': return <LearningIcon sx={{ fontSize: 60, color: 'warning.main' }} />;
      default: return <ImprovementIcon sx={{ fontSize: 60, color: 'error.main' }} />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading your feedback...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!feedback) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">Feedback not available yet.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        {getPerformanceIcon(feedback.performance_level)}
        <Typography variant="h3" gutterBottom sx={{ mt: 2 }}>
          Interview Feedback
        </Typography>
        <Typography variant="h5" color="text.secondary">
          {interview.candidate_name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Completed: {new Date(interview.completed_at).toLocaleDateString()}
        </Typography>
      </Box>

      {/* Overall Score */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h2" sx={{ color: 'white', fontWeight: 'bold' }}>
            {feedback.overall_score}%
          </Typography>
          <Typography variant="h5" sx={{ color: 'white', mt: 1 }}>
            {feedback.performance_level} Performance
          </Typography>
          <Typography variant="body1" sx={{ color: 'white', mt: 2, opacity: 0.9 }}>
            {feedback.encouragement}
          </Typography>
        </CardContent>
      </Card>

      {/* Strengths */}
      {feedback.strengths && feedback.strengths.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckIcon color="success" /> Your Strengths
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {feedback.strengths.map((strength, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Paper sx={{ p: 2, bgcolor: 'success.lighter', border: '1px solid', borderColor: 'success.light' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" color="success.dark">
                        {strength.area}
                      </Typography>
                      <Chip label={`${strength.score}%`} color="success" size="small" />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {strength.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Areas for Improvement */}
      {feedback.areas_for_improvement && feedback.areas_for_improvement.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ImprovementIcon color="warning" /> Areas for Growth
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {feedback.areas_for_improvement.map((improvement, index) => (
                <Grid item xs={12} key={index}>
                  <Paper sx={{ p: 2, bgcolor: 'warning.lighter', border: '1px solid', borderColor: 'warning.light' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" color="warning.dark">
                        {improvement.area}
                      </Typography>
                      <Chip label={`${improvement.score}%`} color="warning" size="small" />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      💡 {improvement.suggestion}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* CV Monitoring Feedback */}
      {feedback.cv_monitoring_feedback && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon color="error" /> Professionalism & Conduct
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1">
                  Professionalism Score
                </Typography>
                <Chip 
                  label={`${feedback.cv_monitoring_feedback.professionalism_score}%`} 
                  color={feedback.cv_monitoring_feedback.professionalism_score >= 80 ? 'success' : 'warning'}
                />
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={feedback.cv_monitoring_feedback.professionalism_score} 
                sx={{ height: 10, borderRadius: 5, mb: 2 }}
                color={feedback.cv_monitoring_feedback.professionalism_score >= 80 ? 'success' : 'warning'}
              />
              <Alert severity={feedback.cv_monitoring_feedback.risk_level === 'low' ? 'info' : 'warning'} sx={{ mb: 2 }}>
                {feedback.cv_monitoring_feedback.message}
              </Alert>
              {feedback.cv_monitoring_feedback.suggestions && feedback.cv_monitoring_feedback.suggestions.length > 0 && (
                <List>
                  {feedback.cv_monitoring_feedback.suggestions.map((suggestion, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <ImprovementIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText primary={suggestion} />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LearningIcon color="primary" /> Recommended Next Steps
          </Typography>
          <List>
            {feedback.next_steps.map((step, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <StarIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary={step} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Final Message */}
      <Paper sx={{ p: 3, bgcolor: 'primary.lighter', border: '2px solid', borderColor: 'primary.main' }}>
        <Typography variant="body1" sx={{ fontStyle: 'italic', textAlign: 'center' }}>
          {feedback.overall_message}
        </Typography>
      </Paper>
    </Container>
  );
};

export default CandidateFeedback;
