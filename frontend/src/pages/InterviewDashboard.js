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
  DialogActions,
  IconButton,
  Tooltip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Visibility as ViewIcon,
  Assessment as ReportIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  SmartToy as BotIcon,
  Add as AddIcon,
  ContentCopy as CopyIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

// ─── Theme constants (matching landing page / admin) ─────
const C = {
  primary: '#2f97f7', primaryDark: '#1a7ad4', primaryLight: '#5db8ff',
  accent: '#0ea5e9', bg: '#0b1120',
  bgCard: 'rgba(255,255,255,0.04)', bgCardHover: 'rgba(255,255,255,0.07)',
  border: 'rgba(255,255,255,0.08)', borderActive: 'rgba(47,151,247,0.4)',
  text: '#e2e8f0', textMuted: '#94a3b8', textDim: '#64748b',
  success: '#10b981', warning: '#f59e0b', error: '#ef4444',
};

const glassCard = {
  background: C.bgCard, backdropFilter: 'blur(24px)',
  border: `1px solid ${C.border}`, borderRadius: '16px',
  transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
  '&:hover': {
    background: C.bgCardHover, borderColor: C.borderActive,
    transform: 'translateY(-2px)', boxShadow: `0 12px 40px ${alpha(C.primary, 0.12)}`,
  },
};
const glassCardStatic = {
  background: C.bgCard, backdropFilter: 'blur(24px)',
  border: `1px solid ${C.border}`, borderRadius: '16px',
};
const tableHeaderCell = {
  color: C.textMuted, fontWeight: 700, fontSize: '.78rem',
  textTransform: 'uppercase', letterSpacing: '.06em',
  borderBottom: `1px solid ${C.border}`, py: 1.5,
};
const tableBodyCell = {
  color: C.text, borderBottom: `1px solid ${alpha(C.border, 0.5)}`, py: 1.5,
};
const primaryBtn = {
  background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`,
  color: '#fff', fontWeight: 700, borderRadius: '10px',
  textTransform: 'none', px: 3, py: 1,
  boxShadow: `0 4px 20px ${alpha(C.primary, 0.3)}`,
  '&:hover': {
    background: `linear-gradient(135deg, ${C.accent}, ${C.primary})`,
    boxShadow: `0 8px 30px ${alpha(C.primary, 0.4)}`, transform: 'translateY(-1px)',
  },
};

const InterviewDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedJobDetails, setSelectedJobDetails] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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

  const totalCandidates = jobs.reduce((sum, job) => sum + (job.interviews?.length || 0), 0);
  const totalCompleted = jobs.reduce((sum, job) => sum + (job.interviews?.filter(i => i.status === 'completed').length || 0), 0);
  const overallAvg = (() => {
    const scored = jobs.filter(job => calculateAverageScore(job.interviews) > 0);
    if (scored.length === 0) return '0.0';
    return (scored.reduce((s, j) => s + parseFloat(calculateAverageScore(j.interviews)), 0) / scored.length).toFixed(1);
  })();

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: C.bg, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress sx={{ color: C.primary }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: C.bg }}>
      {/* Top bar */}
      <Box sx={{ px: 4, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: `1px solid ${C.border}`, background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(20px)' }}>
        <Box>
          <Typography sx={{ color: C.primary, fontWeight: 800, fontSize: '1.4rem' }}>IntelliHire</Typography>
          <Typography sx={{ color: C.textDim, fontSize: '.78rem' }}>HR Dashboard</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button startIcon={<DashboardIcon />} onClick={() => navigate('/dashboard')}
            sx={{ color: C.textMuted, textTransform: 'none', '&:hover': { color: C.text, bgcolor: alpha(C.primary, 0.06) } }}>
            Client Portal
          </Button>
          <Button startIcon={<BotIcon />} onClick={() => navigate('/hr-assistant')}
            sx={{ color: C.textMuted, textTransform: 'none', '&:hover': { color: C.text, bgcolor: alpha(C.primary, 0.06) } }}>
            HR Assistant
          </Button>
          <Typography sx={{ color: C.textDim, fontSize: '.82rem' }}>{user?.full_name || user?.username}</Typography>
          <IconButton onClick={logout} sx={{ color: C.textMuted, '&:hover': { color: C.error } }}>
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
          <Box>
            <Typography sx={{ color: C.text, fontWeight: 800, fontSize: '2rem', lineHeight: 1.2, mb: 0.5 }}>
              HR Dashboard
            </Typography>
            <Typography sx={{ color: C.textMuted, fontSize: '1rem' }}>
              Manage interviews, candidates, and reports
            </Typography>
          </Box>
          <Button sx={primaryBtn} startIcon={<AddIcon />} onClick={() => navigate('/create-job')}>
            Create Job
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, bgcolor: alpha(C.error, 0.1), color: C.error,
            border: `1px solid ${alpha(C.error, 0.3)}`, borderRadius: '12px',
            '& .MuiAlert-icon': { color: C.error } }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Stat cards */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {[
            { label: 'Total Jobs', value: jobs.length, icon: <WorkIcon />, color: C.primary },
            { label: 'Total Candidates', value: totalCandidates, icon: <PersonIcon />, color: C.success },
            { label: 'Completed', value: totalCompleted, icon: <ScheduleIcon />, color: C.warning },
            { label: 'Avg Score', value: overallAvg, icon: <StarIcon />, color: '#8b5cf6' },
          ].map((s, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card sx={{ ...glassCard, p: 2.5 }}>
                <CardContent sx={{ p: '0 !important' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography sx={{ color: C.textMuted, fontSize: '.82rem', fontWeight: 600, mb: 0.5 }}>{s.label}</Typography>
                      <Typography sx={{ color: C.text, fontSize: '2rem', fontWeight: 800, lineHeight: 1.1 }}>{s.value}</Typography>
                    </Box>
                    <Box sx={{ p: 1, borderRadius: '12px', background: alpha(s.color, 0.15) }}>
                      {React.cloneElement(s.icon, { sx: { color: s.color, fontSize: 28 } })}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Jobs Table */}
        <Card sx={{ ...glassCardStatic, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: C.text, display: 'flex', alignItems: 'center', gap: 1 }}>
              <WorkIcon sx={{ color: C.primary }} /> Active Job Postings
            </Typography>
            <Chip label={`${jobs.length} Jobs`} size="small"
              sx={{ background: alpha(C.primary, 0.15), color: C.primary, fontWeight: 700, border: `1px solid ${alpha(C.primary, 0.3)}` }} />
          </Box>

          {jobs.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <WorkIcon sx={{ fontSize: 64, color: C.textDim, mb: 2 }} />
              <Typography sx={{ color: C.textMuted, mb: 2 }}>No interview jobs created yet</Typography>
              <Button sx={primaryBtn} startIcon={<AddIcon />} onClick={() => navigate('/create-job')}>
                Create Your First Job
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={tableHeaderCell}>Job Title</TableCell>
                    <TableCell sx={tableHeaderCell}>Created</TableCell>
                    <TableCell sx={tableHeaderCell}>Duration</TableCell>
                    <TableCell sx={tableHeaderCell}>Candidates</TableCell>
                    <TableCell sx={tableHeaderCell}>Status</TableCell>
                    <TableCell sx={tableHeaderCell}>Avg Score</TableCell>
                    <TableCell sx={tableHeaderCell}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {jobs.map((job) => {
                    const stats = getJobStats(job);
                    const statusLabel = stats.inProgress > 0 ? 'Active' : stats.completed > 0 ? 'Complete' : 'Waiting';
                    const statusColor = stats.inProgress > 0 ? C.warning : stats.completed > 0 ? C.success : C.textDim;
                    return (
                      <TableRow key={job.id} sx={{ '&:hover': { bgcolor: alpha(C.primary, 0.03) } }}>
                        <TableCell sx={tableBodyCell}>
                          <Typography sx={{ fontWeight: 600, color: C.text }}>{job.title}</Typography>
                          <Typography sx={{ color: C.textDim, fontSize: '.8rem' }}>
                            {job.description?.substring(0, 60)}...
                          </Typography>
                        </TableCell>
                        <TableCell sx={tableBodyCell}>{formatDate(job.created_at)}</TableCell>
                        <TableCell sx={tableBodyCell}>{job.duration_minutes} min</TableCell>
                        <TableCell sx={tableBodyCell}>
                          <Box>
                            <Typography sx={{ color: C.text, fontSize: '.9rem', fontWeight: 600, mb: 0.5 }}>
                              {stats.total} total
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}
                              sx={{
                                height: 6, borderRadius: 3, bgcolor: alpha(C.primary, 0.1),
                                '& .MuiLinearProgress-bar': { borderRadius: 3, background: `linear-gradient(90deg, ${C.primary}, ${C.accent})` },
                              }}
                            />
                            <Typography sx={{ color: C.textDim, fontSize: '.75rem', mt: 0.3 }}>
                              {stats.completed} completed
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={tableBodyCell}>
                          <Chip label={statusLabel} size="small"
                            sx={{ background: alpha(statusColor, 0.15), color: statusColor, fontWeight: 700, fontSize: '.75rem', border: `1px solid ${alpha(statusColor, 0.3)}` }} />
                        </TableCell>
                        <TableCell sx={tableBodyCell}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <StarIcon fontSize="small" sx={{ color: C.warning }} />
                            <Typography sx={{ color: C.text, fontWeight: 600 }}>{stats.averageScore}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={tableBodyCell}>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="View Details">
                              <IconButton size="small" onClick={() => handleViewDetails(job.id)} sx={{ color: C.primary }}>
                                <ViewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="View Report">
                              <IconButton size="small" onClick={() => handleViewReport(job.id)} sx={{ color: C.success }}>
                                <ReportIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Applications">
                              <IconButton size="small" onClick={() => navigate(`/applications/${job.id}`)} sx={{ color: C.warning }}>
                                <PersonIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      </Container>

      {/* Job Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#0f1a2e', color: C.text, border: `1px solid ${C.border}`, borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ color: C.text, fontWeight: 700 }}>Job Details</DialogTitle>
        <DialogContent>
          {selectedJobDetails && (
            <Box>
              <Typography sx={{ color: C.text, fontWeight: 700, fontSize: '1.2rem', mb: 2 }}>
                {selectedJobDetails.title}
              </Typography>

              <Typography sx={{ color: C.textMuted, mb: 2 }}>
                <strong style={{ color: C.text }}>Description:</strong> {selectedJobDetails.description}
              </Typography>

              {selectedJobDetails.requirements && (
                <Typography sx={{ color: C.textMuted, mb: 2 }}>
                  <strong style={{ color: C.text }}>Requirements:</strong> {selectedJobDetails.requirements}
                </Typography>
              )}

              <Typography sx={{ color: C.textMuted, mb: 2 }}>
                <strong style={{ color: C.text }}>Duration:</strong> {selectedJobDetails.duration_minutes} minutes
              </Typography>

              <Typography sx={{ color: C.text, fontWeight: 600, mb: 1 }}>Interview Link:</Typography>
              <Box sx={{ p: 2, bgcolor: alpha(C.primary, 0.06), borderRadius: '10px', border: `1px solid ${C.border}`, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ color: C.textMuted, fontSize: '.9rem', wordBreak: 'break-all' }}>
                  {window.location.origin}/interview/{selectedJobDetails.id}
                </Typography>
                <Tooltip title="Copy Link">
                  <IconButton size="small" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/interview/${selectedJobDetails.id}`)}
                    sx={{ color: C.primary }}>
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              <Typography sx={{ color: C.text, fontWeight: 700, fontSize: '1rem', mb: 1.5 }}>
                Scoring Criteria
              </Typography>
              {Object.entries(selectedJobDetails.scoring_criteria || {}).map(([key, criteria]) => (
                <Box key={key} sx={{ mb: 1, p: 1.5, bgcolor: alpha(C.primary, 0.04), borderRadius: '8px', border: `1px solid ${alpha(C.border, 0.5)}` }}>
                  <Typography sx={{ color: C.text, fontSize: '.9rem' }}>
                    <strong>{key.replace('_', ' ').toUpperCase()}</strong>: {criteria.weight * 100}% — {criteria.description}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)} sx={{ color: C.textMuted }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InterviewDashboard;