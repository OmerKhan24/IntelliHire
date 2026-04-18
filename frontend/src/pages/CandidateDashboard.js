import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Card, CardContent, Grid, Chip, Button,
  CircularProgress, Alert, IconButton, Divider, LinearProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Work as WorkIcon,
  PlayArrow as StartIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CompletedIcon,
  HourglassEmpty as PendingIcon,
  Assessment as ReportIcon,
  CloudUpload as UploadIcon,
  Logout as LogoutIcon,
  CalendarMonth as CalendarIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

/* ── Design Tokens (matches landing page dark theme) ── */
const C = {
  primary: '#2f97f7', accent: '#0ea5e9', bg: '#0b1120',
  bgCard: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)',
  text: '#e2e8f0', textMuted: '#94a3b8', textDim: '#64748b',
  success: '#10b981', warning: '#f59e0b', error: '#ef4444',
};
const glassCard = {
  background: C.bgCard, backdropFilter: 'blur(24px)',
  border: `1px solid ${C.border}`, borderRadius: '16px',
};

const CandidateDashboard = () => {
  const [myApplications, setMyApplications] = useState([]);
  const [myInterviews, setMyInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => { loadDashboardData(); }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Load candidate applications
      try {
        const appRes = await api.applications.myApplications();
        setMyApplications(appRes.data.applications || []);
      } catch { setMyApplications([]); }

      // Load interviews
      const candidateEmail = localStorage.getItem('candidate_email');
      if (candidateEmail) {
        try {
          const ivRes = await api.interviews.getMy(candidateEmail);
          setMyInterviews(ivRes.data.interviews || []);
        } catch { setMyInterviews([]); }
      }
    } catch (err) {
      setError('Failed to load dashboard');
    } finally { setLoading(false); }
  };

  const handleUploadCV = async () => {
    if (!cvFile) return;
    try {
      setUploadLoading(true);
      const fd = new FormData();
      fd.append('cv', cvFile);
      await api.candidate.uploadCV(fd);
      setCvFile(null);
    } catch (err) {
      setError('Failed to upload CV');
    } finally { setUploadLoading(false); }
  };

  const statusColor = (s) => {
    const map = {
      applied: C.primary, scoring: C.warning, scored: C.warning,
      shortlisted: C.success, rejected: C.error, scheduled: C.accent,
      interviewed: C.success, hired: '#a78bfa',
    };
    return map[s] || C.textDim;
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={50} sx={{ color: C.primary, mb: 2 }} />
          <Typography sx={{ color: C.textMuted }}>Loading dashboard...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: C.bg, position: 'relative' }}>
      {/* Ambient glow */}
      <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: '10%', left: '5%', width: 500, height: 500, borderRadius: '50%', background: alpha(C.primary, 0.03), filter: 'blur(120px)' }} />
        <Box sx={{ position: 'absolute', bottom: '20%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: alpha(C.accent, 0.025), filter: 'blur(100px)' }} />
      </Box>

      {/* Top bar */}
      <Box sx={{
        px: 4, py: 2, display: 'flex', alignItems: 'center', gap: 2,
        borderBottom: `1px solid ${C.border}`, bgcolor: 'rgba(0,0,0,0.3)',
        backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <PersonIcon sx={{ color: C.primary }} />
        <Typography sx={{ color: C.text, fontWeight: 700, fontSize: '1.1rem', flex: 1 }}>
          Candidate Portal
        </Typography>
        <Chip
          label={user?.username || user?.full_name || 'Candidate'}
          size="small"
          sx={{
            background: alpha(C.primary, 0.15), color: C.primary,
            fontWeight: 700, border: `1px solid ${alpha(C.primary, 0.3)}`,
          }}
        />
        <IconButton size="small" onClick={async () => { await logout(); navigate('/login'); }}
          sx={{ color: C.textMuted, '&:hover': { color: C.error } }}>
          <LogoutIcon fontSize="small" />
        </IconButton>
      </Box>

      <Container maxWidth="lg" sx={{ py: 5, position: 'relative', zIndex: 1 }}>
        {/* Welcome */}
        <Box sx={{ mb: 5 }}>
          <Typography sx={{ color: C.text, fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.02em' }}>
            Welcome back, {user?.full_name || user?.username} 👋
          </Typography>
          <Typography sx={{ color: C.textMuted, mt: 0.5 }}>
            Track your applications, schedule interviews, and view results
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError('')}
            sx={{ mb: 3, bgcolor: alpha(C.error, 0.1), color: C.error, border: `1px solid ${alpha(C.error, 0.3)}`, '& .MuiAlert-icon': { color: C.error } }}>
            {error}
          </Alert>
        )}

        {/* Stats row */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { label: 'Applications', value: myApplications.length, color: C.primary, icon: <WorkIcon /> },
            { label: 'Shortlisted', value: myApplications.filter(a => a.status === 'shortlisted').length, color: C.success, icon: <CompletedIcon /> },
            { label: 'Interviews', value: myInterviews.length, color: C.accent, icon: <CalendarIcon /> },
            { label: 'Completed', value: myInterviews.filter(i => i.status === 'completed').length, color: '#a78bfa', icon: <ReportIcon /> },
          ].map(({ label, value, color, icon }) => (
            <Grid item xs={6} md={3} key={label}>
              <Card sx={{ ...glassCard, p: 2.5, borderLeft: `3px solid ${color}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ color, opacity: 0.8 }}>{icon}</Box>
                  <Box>
                    <Typography sx={{ color: C.text, fontWeight: 800, fontSize: '1.5rem', lineHeight: 1 }}>{value}</Typography>
                    <Typography sx={{ color: C.textDim, fontSize: '0.75rem', mt: 0.3 }}>{label}</Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* CV Upload */}
        <Card sx={{ ...glassCard, mb: 4, background: `linear-gradient(135deg, ${alpha(C.primary, 0.08)}, ${alpha(C.accent, 0.05)})`, border: `1px solid ${alpha(C.primary, 0.2)}` }}>
          <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ width: 48, height: 48, borderRadius: '12px', background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UploadIcon sx={{ color: '#fff', fontSize: 24 }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Typography sx={{ color: C.text, fontWeight: 700, fontSize: '1rem' }}>Upload Your CV</Typography>
              <Typography sx={{ color: C.textMuted, fontSize: '0.85rem' }}>Keep your resume updated for better opportunities</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              <input accept=".pdf,.doc,.docx" style={{ display: 'none' }} id="cv-upload" type="file"
                onChange={(e) => setCvFile(e.target.files[0])} />
              <label htmlFor="cv-upload">
                <Button component="span" variant="outlined"
                  sx={{ borderColor: alpha(C.primary, 0.4), color: C.text, textTransform: 'none', borderRadius: '10px', '&:hover': { borderColor: C.primary, bgcolor: alpha(C.primary, 0.08) } }}>
                  {cvFile ? cvFile.name : 'Choose File'}
                </Button>
              </label>
              <Button variant="contained" onClick={handleUploadCV} disabled={!cvFile || uploadLoading}
                sx={{
                  background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, color: '#fff',
                  fontWeight: 700, borderRadius: '10px', textTransform: 'none',
                  '&:disabled': { background: 'rgba(255,255,255,0.06)', color: C.textDim },
                }}>
                {uploadLoading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Upload'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* My Applications */}
        <Typography sx={{ color: C.text, fontWeight: 700, fontSize: '1.2rem', mb: 2 }}>
          📋 My Applications
        </Typography>

        {myApplications.length === 0 ? (
          <Card sx={{ ...glassCard, p: 5, mb: 4, textAlign: 'center' }}>
            <WorkIcon sx={{ fontSize: 48, color: C.textDim, mb: 1 }} />
            <Typography sx={{ color: C.text, fontWeight: 600, mb: 0.5 }}>No Applications Yet</Typography>
            <Typography sx={{ color: C.textMuted, fontSize: '0.9rem' }}>
              Apply to jobs via shared links from recruiters
            </Typography>
          </Card>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
            {myApplications.map((app) => (
              <Card key={app.id} sx={{
                ...glassCard, p: 0, overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': { borderColor: alpha(C.primary, 0.3), transform: 'translateY(-2px)', boxShadow: `0 8px 30px ${alpha(C.primary, 0.12)}` },
              }}>
                <Box sx={{ display: 'flex', alignItems: 'stretch' }}>
                  {/* Status bar */}
                  <Box sx={{ width: 4, background: statusColor(app.status), flexShrink: 0 }} />
                  <CardContent sx={{ flex: 1, p: 2.5, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ flex: 1, minWidth: 200 }}>
                      <Typography sx={{ color: C.text, fontWeight: 700, fontSize: '1rem' }}>
                        {app.job_title || 'Position'}
                      </Typography>
                      <Typography sx={{ color: C.textDim, fontSize: '0.8rem', mt: 0.3 }}>
                        {app.company_name && `${app.company_name} · `}Applied {formatDate(app.applied_at)}
                        {app.ats_score != null && ` · ATS: ${app.ats_score.toFixed(0)}%`}
                      </Typography>
                    </Box>
                    <Chip label={app.status.replace(/_/g, ' ').toUpperCase()} size="small"
                      sx={{ fontWeight: 700, fontSize: '0.7rem', background: alpha(statusColor(app.status), 0.15), color: statusColor(app.status), border: `1px solid ${alpha(statusColor(app.status), 0.3)}` }} />

                    {/* Action buttons based on status */}
                    {app.status === 'shortlisted' && (
                      <Button size="small" variant="contained" startIcon={<CalendarIcon />}
                        onClick={() => navigate(`/schedule/${app.id}`)}
                        sx={{
                          background: `linear-gradient(135deg, ${C.success}, #34d399)`, color: '#fff',
                          fontWeight: 700, borderRadius: '10px', textTransform: 'none', fontSize: '0.8rem',
                        }}>
                        Schedule Interview
                      </Button>
                    )}
                    {app.status === 'scheduled' && (
                      <Button size="small" variant="outlined" startIcon={<ScheduleIcon />}
                        onClick={() => navigate(`/schedule/${app.id}`)}
                        sx={{
                          borderColor: alpha(C.accent, 0.4), color: C.accent,
                          fontWeight: 600, borderRadius: '10px', textTransform: 'none', fontSize: '0.8rem',
                          '&:hover': { borderColor: C.accent, bgcolor: alpha(C.accent, 0.08) },
                        }}>
                        View Schedule
                      </Button>
                    )}
                  </CardContent>
                </Box>
              </Card>
            ))}
          </Box>
        )}

        {/* My Interviews */}
        <Typography sx={{ color: C.text, fontWeight: 700, fontSize: '1.2rem', mb: 2 }}>
          🎤 My Interviews
        </Typography>

        {myInterviews.length === 0 ? (
          <Card sx={{ ...glassCard, p: 5, textAlign: 'center' }}>
            <CalendarIcon sx={{ fontSize: 48, color: C.textDim, mb: 1 }} />
            <Typography sx={{ color: C.text, fontWeight: 600, mb: 0.5 }}>No Interviews Yet</Typography>
            <Typography sx={{ color: C.textMuted, fontSize: '0.9rem' }}>
              Once you're shortlisted, you'll be invited to schedule your AI interview
            </Typography>
          </Card>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {myInterviews.map((iv) => {
              const isCompleted = iv.status === 'completed';
              const isPending = iv.status === 'pending';
              return (
                <Card key={iv.id} sx={{
                  ...glassCard, p: 0, overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': { borderColor: alpha(isCompleted ? C.success : C.primary, 0.3), transform: 'translateY(-2px)' },
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'stretch' }}>
                    <Box sx={{
                      width: 4, flexShrink: 0,
                      background: isCompleted ? `linear-gradient(180deg, ${C.success}, #34d399)` : iv.status === 'in_progress' ? `linear-gradient(180deg, ${C.warning}, #fbbf24)` : C.textDim,
                    }} />
                    <CardContent sx={{ flex: 1, p: 2.5, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography sx={{ color: C.text, fontWeight: 700 }}>
                          {iv.job?.title || 'Interview'}
                        </Typography>
                        <Typography sx={{ color: C.textDim, fontSize: '0.8rem', mt: 0.3 }}>
                          {iv.job?.company && `${iv.job.company} · `}
                          {isPending && iv.accessed_at && `Accessed: ${formatDate(iv.accessed_at)}`}
                          {iv.status === 'in_progress' && iv.started_at && `Started: ${formatDate(iv.started_at)}`}
                          {isCompleted && iv.completed_at && `Completed: ${formatDate(iv.completed_at)}`}
                          {iv.final_score != null && ` · Score: ${iv.final_score.toFixed(1)}%`}
                        </Typography>
                      </Box>
                      <Chip
                        label={iv.status.replace(/_/g, ' ').toUpperCase()} size="small"
                        sx={{
                          fontWeight: 700, fontSize: '0.7rem',
                          background: isCompleted ? alpha(C.success, 0.15) : iv.status === 'in_progress' ? alpha(C.warning, 0.15) : alpha(C.textDim, 0.15),
                          color: isCompleted ? C.success : iv.status === 'in_progress' ? C.warning : C.textDim,
                          border: `1px solid ${alpha(isCompleted ? C.success : iv.status === 'in_progress' ? C.warning : C.textDim, 0.3)}`,
                        }}
                      />
                      {isCompleted && (
                        <Button size="small" variant="contained" startIcon={<ReportIcon />}
                          onClick={() => navigate(`/feedback/${iv.id}`)}
                          sx={{
                            background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, color: '#fff',
                            fontWeight: 700, borderRadius: '10px', textTransform: 'none', fontSize: '0.8rem',
                            '&:hover': { transform: 'translateY(-1px)', boxShadow: `0 4px 15px ${alpha(C.primary, 0.3)}` },
                          }}>
                          View Report
                        </Button>
                      )}
                    </CardContent>
                  </Box>
                </Card>
              );
            })}
          </Box>
        )}

        {/* Info */}
        <Card sx={{ ...glassCard, mt: 4, p: 3, textAlign: 'center', background: alpha(C.primary, 0.04), border: `1px solid ${alpha(C.primary, 0.15)}` }}>
          <Typography sx={{ color: C.text, fontWeight: 700, mb: 1 }}>📧 How It Works</Typography>
          <Typography sx={{ color: C.textMuted, fontSize: '0.9rem', maxWidth: 500, mx: 'auto' }}>
            Apply through shared job links → Get shortlisted by AI screening → Schedule your interview → Complete the AI interview → View your results
          </Typography>
        </Card>
      </Container>
    </Box>
  );
};

export default CandidateDashboard;
