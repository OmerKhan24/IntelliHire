import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Card, Button, CircularProgress, alpha
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Assessment as ReportIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const C = {
  bg: '#0b1120', primary: '#2f97f7', accent: '#0ea5e9',
  text: '#e2e8f0', textMuted: '#94a3b8',
  bgCard: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)',
  success: '#22c55e'
};

const glassCard = {
  background: C.bgCard, backdropFilter: 'blur(24px)',
  border: `1px solid ${C.border}`, borderRadius: '16px'
};

const ThankYouPage = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('waiting'); // waiting | ready | error
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    if (!interviewId) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await api.interviews.getFeedback(interviewId);
        if (!cancelled && res.data?.feedback) {
          setStatus('ready');
        }
      } catch {
        // Feedback not ready yet — keep polling
        if (!cancelled) {
          setPollCount(c => c + 1);
        }
      }
    };
    poll();
    const interval = setInterval(poll, 10000); // poll every 10s
    return () => { cancelled = true; clearInterval(interval); };
  }, [interviewId]);

  return (
    <Box sx={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container maxWidth="sm">
        <Card sx={{ ...glassCard, p: 5, textAlign: 'center' }}>
          {/* Success Icon */}
          <Box sx={{
            width: 80, height: 80, borderRadius: '50%', mx: 'auto', mb: 3,
            background: alpha(C.success, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <CheckIcon sx={{ fontSize: 44, color: C.success }} />
          </Box>

          <Typography sx={{ color: C.text, fontWeight: 800, fontSize: '1.8rem', mb: 1 }}>
            Thank You!
          </Typography>
          <Typography sx={{ color: C.textMuted, fontSize: '1.05rem', mb: 4, maxWidth: 400, mx: 'auto' }}>
            Your interview has been completed successfully. Our AI is analyzing your performance.
          </Typography>

          {/* Status */}
          {status === 'waiting' && (
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 2 }}>
                <CircularProgress size={22} sx={{ color: C.primary }} />
                <Typography sx={{ color: C.primary, fontWeight: 600 }}>Generating your report...</Typography>
              </Box>
              <Typography sx={{ color: alpha(C.textMuted, 0.6), fontSize: '0.8rem' }}>
                This usually takes 1-2 minutes. The page will update automatically.
              </Typography>
            </Box>
          )}

          {status === 'ready' && (
            <Box sx={{ mb: 4 }}>
              <Box sx={{ p: 2, borderRadius: '12px', background: alpha(C.success, 0.06), border: `1px solid ${alpha(C.success, 0.15)}`, mb: 3 }}>
                <Typography sx={{ color: C.success, fontWeight: 600 }}>
                  ✅ Your feedback is ready!
                </Typography>
              </Box>
              <Button
                onClick={() => navigate(`/feedback/${interviewId}`)}
                startIcon={<ReportIcon />}
                sx={{
                  px: 4, py: 1.3, fontWeight: 700, borderRadius: '10px', textTransform: 'none',
                  background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`,
                  color: '#fff', '&:hover': { opacity: 0.9 }, fontSize: '1rem'
                }}
              >
                View Your Results
              </Button>
            </Box>
          )}

          {/* Back to dashboard */}
          <Button
            onClick={() => navigate('/my-interviews')}
            startIcon={<HomeIcon />}
            sx={{ color: C.textMuted, textTransform: 'none', '&:hover': { color: C.primary } }}
          >
            Back to Dashboard
          </Button>
        </Card>
      </Container>
    </Box>
  );
};

export default ThankYouPage;
