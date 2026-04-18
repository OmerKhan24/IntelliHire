import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Card, Chip, LinearProgress,
  CircularProgress, alpha
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  TrendingUp as ImprovementIcon,
  School as LearningIcon,
  Star as StarIcon,
  Warning as WarningIcon,
  EmojiEvents as TrophyIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const C = {
  bg: '#0b1120', primary: '#2f97f7', accent: '#0ea5e9',
  text: '#e2e8f0', textMuted: '#94a3b8',
  bgCard: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)',
  success: '#22c55e', warning: '#f59e0b', error: '#ef4444'
};

const glassCard = {
  background: C.bgCard, backdropFilter: 'blur(24px)',
  border: `1px solid ${C.border}`, borderRadius: '16px'
};

const CandidateFeedback = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [interview, setInterview] = useState(null);

  useEffect(() => { loadFeedback(); }, [interviewId]);

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

  const scoreColor = (s) => s >= 85 ? C.success : s >= 70 ? C.primary : s >= 55 ? C.warning : C.error;

  const perfIcon = (level) => {
    const s = { fontSize: 56 };
    switch (level) {
      case 'Excellent': return <TrophyIcon sx={{ ...s, color: '#facc15' }} />;
      case 'Good': return <StarIcon sx={{ ...s, color: C.primary }} />;
      case 'Fair': return <LearningIcon sx={{ ...s, color: C.warning }} />;
      default: return <ImprovementIcon sx={{ ...s, color: C.error }} />;
    }
  };

  if (loading) return (
    <Box sx={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
      <CircularProgress sx={{ color: C.primary }} />
      <Typography sx={{ color: C.textMuted }}>Loading your feedback...</Typography>
    </Box>
  );

  if (error) return (
    <Box sx={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card sx={{ ...glassCard, p: 4, maxWidth: 500, textAlign: 'center' }}>
        <WarningIcon sx={{ fontSize: 48, color: C.error, mb: 2 }} />
        <Typography sx={{ color: C.text, fontWeight: 600 }}>{error}</Typography>
      </Card>
    </Box>
  );

  if (!feedback) return (
    <Box sx={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card sx={{ ...glassCard, p: 4, maxWidth: 500, textAlign: 'center' }}>
        <Typography sx={{ color: C.textMuted }}>Feedback not available yet. Check back later.</Typography>
      </Card>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', background: C.bg, py: 5 }}>
      <Container maxWidth="md">
        {/* Back */}
        <Box onClick={() => navigate('/my-interviews')} sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 4, cursor: 'pointer', color: C.textMuted, '&:hover': { color: C.primary } }}>
          <BackIcon fontSize="small" />
          <Typography sx={{ fontSize: '0.9rem' }}>Back to Dashboard</Typography>
        </Box>

        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          {perfIcon(feedback.performance_level)}
          <Typography sx={{ color: C.text, fontWeight: 800, fontSize: '2rem', mt: 2 }}>
            Interview Feedback
          </Typography>
          <Typography sx={{ color: C.textMuted, fontSize: '1.1rem', mt: 0.5 }}>
            {interview?.candidate_name}
          </Typography>
          {interview?.completed_at && (
            <Typography sx={{ color: alpha(C.textMuted, 0.6), fontSize: '0.85rem', mt: 0.5 }}>
              Completed {new Date(interview.completed_at).toLocaleDateString()}
            </Typography>
          )}
        </Box>

        {/* Overall Score */}
        <Card sx={{ ...glassCard, mb: 4, p: 0, overflow: 'hidden' }}>
          <Box sx={{
            background: `linear-gradient(135deg, ${C.primary} 0%, ${C.accent} 100%)`,
            py: 5, px: 4, textAlign: 'center'
          }}>
            <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '3.5rem', lineHeight: 1 }}>
              {feedback.overall_score}%
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600, fontSize: '1.2rem', mt: 1 }}>
              {feedback.performance_level} Performance
            </Typography>
            {feedback.encouragement && (
              <Typography sx={{ color: 'rgba(255,255,255,0.75)', mt: 2, maxWidth: 500, mx: 'auto', fontSize: '0.95rem' }}>
                {feedback.encouragement}
              </Typography>
            )}
          </Box>
        </Card>

        {/* Strengths */}
        {feedback.strengths?.length > 0 && (
          <Card sx={{ ...glassCard, mb: 3, p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
              <CheckIcon sx={{ color: C.success }} />
              <Typography sx={{ color: C.text, fontWeight: 700, fontSize: '1.15rem' }}>Your Strengths</Typography>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              {feedback.strengths.map((s, i) => (
                <Box key={i} sx={{ p: 2, borderRadius: '12px', background: alpha(C.success, 0.08), border: `1px solid ${alpha(C.success, 0.2)}` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography sx={{ color: C.success, fontWeight: 600 }}>{s.area}</Typography>
                    <Chip label={`${s.score}%`} size="small" sx={{ bgcolor: alpha(C.success, 0.15), color: C.success, fontWeight: 700 }} />
                  </Box>
                  <LinearProgress variant="determinate" value={s.score} sx={{ height: 4, borderRadius: 2, mb: 1, bgcolor: alpha(C.success, 0.1), '& .MuiLinearProgress-bar': { bgcolor: C.success, borderRadius: 2 } }} />
                  <Typography sx={{ color: C.textMuted, fontSize: '0.85rem' }}>{s.description}</Typography>
                </Box>
              ))}
            </Box>
          </Card>
        )}

        {/* Areas for Improvement */}
        {feedback.areas_for_improvement?.length > 0 && (
          <Card sx={{ ...glassCard, mb: 3, p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
              <ImprovementIcon sx={{ color: C.warning }} />
              <Typography sx={{ color: C.text, fontWeight: 700, fontSize: '1.15rem' }}>Areas for Growth</Typography>
            </Box>
            {feedback.areas_for_improvement.map((item, i) => (
              <Box key={i} sx={{ p: 2, borderRadius: '12px', background: alpha(C.warning, 0.06), border: `1px solid ${alpha(C.warning, 0.15)}`, mb: i < feedback.areas_for_improvement.length - 1 ? 2 : 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography sx={{ color: C.warning, fontWeight: 600 }}>{item.area}</Typography>
                  <Chip label={`${item.score}%`} size="small" sx={{ bgcolor: alpha(C.warning, 0.15), color: C.warning, fontWeight: 700 }} />
                </Box>
                <LinearProgress variant="determinate" value={item.score} sx={{ height: 4, borderRadius: 2, mb: 1, bgcolor: alpha(C.warning, 0.1), '& .MuiLinearProgress-bar': { bgcolor: C.warning, borderRadius: 2 } }} />
                <Typography sx={{ color: C.textMuted, fontSize: '0.85rem', fontStyle: 'italic' }}>
                  💡 {item.suggestion}
                </Typography>
              </Box>
            ))}
          </Card>
        )}

        {/* CV Monitoring / Professionalism */}
        {feedback.cv_monitoring_feedback && (
          <Card sx={{ ...glassCard, mb: 3, p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
              <WarningIcon sx={{ color: C.error }} />
              <Typography sx={{ color: C.text, fontWeight: 700, fontSize: '1.15rem' }}>Professionalism & Conduct</Typography>
            </Box>
            <Box sx={{ p: 2, borderRadius: '12px', background: alpha(C.primary, 0.04), border: `1px solid ${alpha(C.border, 1)}` }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography sx={{ color: C.text }}>Professionalism Score</Typography>
                <Chip label={`${feedback.cv_monitoring_feedback.professionalism_score}%`} size="small"
                  sx={{ bgcolor: alpha(feedback.cv_monitoring_feedback.professionalism_score >= 80 ? C.success : C.warning, 0.15),
                    color: feedback.cv_monitoring_feedback.professionalism_score >= 80 ? C.success : C.warning, fontWeight: 700 }} />
              </Box>
              <LinearProgress variant="determinate" value={feedback.cv_monitoring_feedback.professionalism_score}
                sx={{ height: 6, borderRadius: 3, mb: 2, bgcolor: alpha(C.textMuted, 0.1),
                  '& .MuiLinearProgress-bar': { bgcolor: feedback.cv_monitoring_feedback.professionalism_score >= 80 ? C.success : C.warning, borderRadius: 3 } }} />
              <Box sx={{ p: 2, borderRadius: '8px', background: alpha(feedback.cv_monitoring_feedback.risk_level === 'low' ? C.primary : C.warning, 0.08),
                border: `1px solid ${alpha(feedback.cv_monitoring_feedback.risk_level === 'low' ? C.primary : C.warning, 0.2)}`, mb: 2 }}>
                <Typography sx={{ color: C.text, fontSize: '0.9rem' }}>{feedback.cv_monitoring_feedback.message}</Typography>
              </Box>
              {feedback.cv_monitoring_feedback.suggestions?.length > 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {feedback.cv_monitoring_feedback.suggestions.map((sug, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <ImprovementIcon sx={{ color: C.warning, fontSize: 18, mt: 0.3 }} />
                      <Typography sx={{ color: C.textMuted, fontSize: '0.85rem' }}>{sug}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Card>
        )}

        {/* Next Steps */}
        {feedback.next_steps?.length > 0 && (
          <Card sx={{ ...glassCard, mb: 3, p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
              <LearningIcon sx={{ color: C.primary }} />
              <Typography sx={{ color: C.text, fontWeight: 700, fontSize: '1.15rem' }}>Recommended Next Steps</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {feedback.next_steps.map((step, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 1.5, borderRadius: '10px', background: alpha(C.primary, 0.04) }}>
                  <StarIcon sx={{ color: C.primary, fontSize: 20, mt: 0.2 }} />
                  <Typography sx={{ color: C.text, fontSize: '0.9rem' }}>{step}</Typography>
                </Box>
              ))}
            </Box>
          </Card>
        )}

        {/* Final Message */}
        {feedback.overall_message && (
          <Card sx={{ ...glassCard, p: 3, textAlign: 'center', background: alpha(C.primary, 0.04), border: `1px solid ${alpha(C.primary, 0.15)}` }}>
            <Typography sx={{ color: C.text, fontStyle: 'italic', fontSize: '1rem', maxWidth: 600, mx: 'auto' }}>
              "{feedback.overall_message}"
            </Typography>
          </Card>
        )}
      </Container>
    </Box>
  );
};

export default CandidateFeedback;
