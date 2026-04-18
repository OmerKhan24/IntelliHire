import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Typography, Box, Card, Paper, Button, Chip, CircularProgress,
  Alert, Grid, LinearProgress, IconButton, Tooltip, TextField, Dialog,
  DialogTitle, DialogContent, DialogActions, Divider, Snackbar
} from '@mui/material';
import {
  Assessment as ScoreIcon, ContentCut as ShortlistIcon,
  Schedule as ScheduleIcon, PlayArrow as PipelineIcon,
  Person as PersonIcon, Email as EmailIcon, Star as StarIcon,
  CheckCircle as CheckIcon, Cancel as RejectIcon,
  ContentCopy as CopyIcon, Share as ShareIcon,
  Publish as PublishIcon, Refresh as RefreshIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

/* ── Styles ── */
const bgGrad = { minHeight: '100vh', background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%)', pb: 6 };
const glassCard = {
  background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
};
const tealGrad = 'linear-gradient(135deg,#0891b2,#06b6d4)';

const STATUS_COLORS = {
  applied: '#3b82f6', scoring: '#f59e0b', scored: '#8b5cf6',
  shortlisted: '#10b981', rejected: '#ef4444', scheduled: '#06b6d4',
  interviewed: '#22d3ee', hired: '#14b8a6', archived: '#64748b',
};

export default function ApplicationsPipeline() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [jobInfo, setJobInfo] = useState(null);
  const [applications, setApplications] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [snackbar, setSnackbar] = useState('');
  const [filterStatus, setFilterStatus] = useState(null);

  // Publish dialog
  const [publishOpen, setPublishOpen] = useState(false);
  const [pubData, setPubData] = useState({
    company_name: '', location: '', job_type: 'full_time',
    salary_range: '', max_shortlist: 5, application_deadline: '',
  });

  // Schedule dialog
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [schedData, setSchedData] = useState({ start_time: '', gap_minutes: 45 });

  const loadApplications = useCallback(async () => {
    try {
      const res = await api.applications.listForJob(jobId, filterStatus);
      if (res.data.success) {
        setJobInfo(res.data.job);
        setApplications(res.data.applications);
        setCounts(res.data.counts);
        // Pre-fill publish dialog
        if (res.data.job) {
          setPubData(prev => ({
            ...prev,
            company_name: res.data.job.company_name || prev.company_name,
            max_shortlist: res.data.job.max_shortlist || 5,
          }));
        }
      }
    } catch (err) {
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [jobId, filterStatus]);

  useEffect(() => { loadApplications(); }, [loadApplications]);

  /* ── Actions ── */
  const handlePublish = async () => {
    setActionLoading('publish');
    try {
      const res = await api.applications.publish(jobId, { publish: true, ...pubData });
      if (res.data.success) {
        setSnackbar(`Published! Share link: ${res.data.share_link}`);
        setPublishOpen(false);
        loadApplications();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Publish failed');
    } finally {
      setActionLoading('');
    }
  };

  const handleScoreAll = async () => {
    setActionLoading('score');
    try {
      const res = await api.applications.scoreAll(jobId);
      if (res.data.success) {
        setSnackbar(`Scored ${res.data.scored} applications`);
        loadApplications();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Scoring failed');
    } finally {
      setActionLoading('');
    }
  };

  const handleShortlist = async () => {
    setActionLoading('shortlist');
    try {
      const res = await api.applications.shortlist(jobId);
      if (res.data.success) {
        setSnackbar(`Shortlisted ${res.data.shortlisted}, rejected ${res.data.rejected}`);
        loadApplications();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Shortlisting failed');
    } finally {
      setActionLoading('');
    }
  };

  const handleSchedule = async () => {
    setActionLoading('schedule');
    try {
      const res = await api.applications.schedule(jobId, schedData.start_time || undefined, schedData.gap_minutes);
      if (res.data.success) {
        setSnackbar(`Scheduled ${res.data.interviews_scheduled} interviews`);
        setScheduleOpen(false);
        loadApplications();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Scheduling failed');
    } finally {
      setActionLoading('');
    }
  };

  const handleRunPipeline = async () => {
    setActionLoading('pipeline');
    try {
      const res = await api.applications.runPipeline(jobId);
      if (res.data.success) {
        setSnackbar(`Pipeline complete: ${res.data.scored} scored, ${res.data.shortlisted} shortlisted, ${res.data.interviews_scheduled} scheduled`);
        loadApplications();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Pipeline failed');
    } finally {
      setActionLoading('');
    }
  };

  const copyShareLink = () => {
    if (jobInfo?.share_token) {
      const link = `${window.location.origin}/apply/${jobInfo.share_token}`;
      navigator.clipboard.writeText(link);
      setSnackbar('Share link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <Box sx={{ ...bgGrad, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: '#06b6d4' }} />
      </Box>
    );
  }

  const ScoreBadge = ({ score }) => {
    const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : score >= 40 ? '#f97316' : '#ef4444';
    return (
      <Box sx={{
        width: 48, height: 48, borderRadius: '50%', border: `3px solid ${color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, color, fontSize: '0.85rem',
      }}>
        {Math.round(score)}
      </Box>
    );
  };

  return (
    <Box sx={bgGrad}>
      <Container maxWidth="lg" sx={{ pt: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800 }}>
              {jobInfo?.title || 'Applications'}
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.5)', mt: 0.5 }}>
              {counts.total || 0} applications &middot; {counts.shortlisted || 0} shortlisted
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {jobInfo?.is_published ? (
              <Button startIcon={<CopyIcon />} onClick={copyShareLink}
                sx={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', textTransform: 'none', fontWeight: 600 }}>
                Copy Share Link
              </Button>
            ) : (
              <Button startIcon={<PublishIcon />} onClick={() => setPublishOpen(true)}
                sx={{ background: tealGrad, color: '#fff', textTransform: 'none', fontWeight: 600 }}>
                Publish Job
              </Button>
            )}
            <Button startIcon={<RefreshIcon />} onClick={loadApplications}
              sx={{ background: 'rgba(255,255,255,0.08)', color: '#fff', textTransform: 'none' }}>
              Refresh
            </Button>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

        {/* Pipeline Stats */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {[
            { label: 'Applied', count: counts.applied || 0, color: '#3b82f6' },
            { label: 'Scored', count: counts.scored || 0, color: '#8b5cf6' },
            { label: 'Shortlisted', count: counts.shortlisted || 0, color: '#10b981' },
            { label: 'Rejected', count: counts.rejected || 0, color: '#ef4444' },
            { label: 'Scheduled', count: counts.scheduled || 0, color: '#06b6d4' },
            { label: 'Interviewed', count: counts.interviewed || 0, color: '#22d3ee' },
          ].map(s => (
            <Grid item xs={6} sm={4} md={2} key={s.label}>
              <Paper
                onClick={() => setFilterStatus(filterStatus === s.label.toLowerCase() ? null : s.label.toLowerCase())}
                sx={{
                  ...glassCard, p: 2, textAlign: 'center', cursor: 'pointer',
                  borderColor: filterStatus === s.label.toLowerCase() ? s.color : 'rgba(255,255,255,0.1)',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: s.color, transform: 'translateY(-2px)' },
                }}>
                <Typography variant="h4" sx={{ color: s.color, fontWeight: 800 }}>{s.count}</Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>{s.label}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Action Buttons */}
        <Card sx={{ ...glassCard, p: 3, mb: 4 }}>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, mb: 2 }}>Pipeline Actions</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained" startIcon={<ScoreIcon />} disabled={!!actionLoading || !counts.applied}
              onClick={handleScoreAll}
              sx={{ background: 'linear-gradient(135deg,#8b5cf6,#a78bfa)', textTransform: 'none', fontWeight: 600 }}>
              {actionLoading === 'score' ? <CircularProgress size={20} /> : `Score CVs (${counts.applied || 0})`}
            </Button>
            <Button
              variant="contained" startIcon={<ShortlistIcon />} disabled={!!actionLoading || !counts.scored}
              onClick={handleShortlist}
              sx={{ background: 'linear-gradient(135deg,#10b981,#34d399)', textTransform: 'none', fontWeight: 600 }}>
              {actionLoading === 'shortlist' ? <CircularProgress size={20} /> : `Shortlist Top ${jobInfo?.max_shortlist || 5}`}
            </Button>
            <Button
              variant="contained" startIcon={<ScheduleIcon />} disabled={!!actionLoading || !counts.shortlisted}
              onClick={() => setScheduleOpen(true)}
              sx={{ background: tealGrad, textTransform: 'none', fontWeight: 600 }}>
              Schedule Interviews
            </Button>
            <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />
            <Button
              variant="contained" startIcon={<PipelineIcon />} disabled={!!actionLoading || !counts.applied}
              onClick={handleRunPipeline}
              sx={{ background: 'linear-gradient(135deg,#f59e0b,#fbbf24)', color: '#1e293b', textTransform: 'none', fontWeight: 700 }}>
              {actionLoading === 'pipeline' ? <CircularProgress size={20} /> : 'Run Full Pipeline'}
            </Button>
          </Box>
          {actionLoading && (
            <LinearProgress sx={{ mt: 2, borderRadius: 4, '& .MuiLinearProgress-bar': { background: tealGrad } }} />
          )}
        </Card>

        {/* Application List */}
        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, mb: 2 }}>
          Candidates {filterStatus && <Chip label={filterStatus} size="small" onDelete={() => setFilterStatus(null)}
            sx={{ ml: 1, background: STATUS_COLORS[filterStatus] + '33', color: STATUS_COLORS[filterStatus] }} />}
        </Typography>

        {applications.length === 0 ? (
          <Card sx={{ ...glassCard, p: 6, textAlign: 'center' }}>
            <Typography sx={{ color: 'rgba(255,255,255,0.5)' }}>
              {jobInfo?.is_published
                ? 'No applications yet. Share the link to start receiving applications!'
                : 'Publish this job to start receiving applications.'}
            </Typography>
          </Card>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {applications.map((app, idx) => (
              <Card key={app.id} sx={{
                ...glassCard, p: 3, display: 'flex', alignItems: 'center', gap: 3,
                transition: 'all 0.2s', '&:hover': { borderColor: 'rgba(255,255,255,0.2)', transform: 'translateX(4px)' },
              }}>
                {/* Rank */}
                <Box sx={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: idx < (jobInfo?.max_shortlist || 5) && app.ats_score ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: idx < (jobInfo?.max_shortlist || 5) && app.ats_score ? '#10b981' : 'rgba(255,255,255,0.4)',
                  fontWeight: 700, fontSize: '0.85rem',
                }}>
                  #{idx + 1}
                </Box>

                {/* Info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>
                      {app.candidate_name}
                    </Typography>
                    <Chip
                      label={app.status}
                      size="small"
                      sx={{
                        background: (STATUS_COLORS[app.status] || '#64748b') + '22',
                        color: STATUS_COLORS[app.status] || '#64748b',
                        fontWeight: 600, fontSize: '0.7rem',
                      }}
                    />
                  </Box>
                  <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                    {app.candidate_email}
                    {app.applied_at && ` · Applied ${new Date(app.applied_at).toLocaleDateString()}`}
                  </Typography>
                  {/* ATS breakdown mini */}
                  {app.ats_breakdown?.breakdown && (
                    <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                      {Object.entries(app.ats_breakdown.breakdown).map(([k, v]) => (
                        <Chip key={k} label={`${k.replace(/_/g, ' ')}: ${Math.round(v)}`} size="small"
                          sx={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', fontSize: '0.65rem' }} />
                      ))}
                    </Box>
                  )}
                </Box>

                {/* ATS Score */}
                {app.ats_score != null && <ScoreBadge score={app.ats_score} />}

                {/* Actions */}
                {app.status === 'interviewed' && (
                  <Tooltip title="View Report">
                    <IconButton onClick={() => navigate(`/report/${jobId}`)}
                      sx={{ color: '#06b6d4' }}>
                      <ScoreIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Card>
            ))}
          </Box>
        )}
      </Container>

      {/* ── Publish Dialog ── */}
      <Dialog open={publishOpen} onClose={() => setPublishOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { background: '#1e293b', color: '#fff', borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Publish Job</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'rgba(255,255,255,0.6)', mb: 2 }}>
            Fill in details and publish to generate a shareable application link.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {[
              { label: 'Company Name', key: 'company_name' },
              { label: 'Location', key: 'location' },
              { label: 'Salary Range', key: 'salary_range' },
              { label: 'Max Shortlist', key: 'max_shortlist', type: 'number' },
              { label: 'Application Deadline', key: 'application_deadline', type: 'datetime-local' },
            ].map(f => (
              <TextField
                key={f.key} label={f.label} type={f.type || 'text'}
                value={pubData[f.key] || ''}
                onChange={e => setPubData(p => ({ ...p, [f.key]: e.target.value }))}
                InputLabelProps={f.type === 'datetime-local' ? { shrink: true } : undefined}
                sx={{
                  '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } },
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
                }}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setPublishOpen(false)} sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handlePublish} variant="contained" disabled={actionLoading === 'publish'}
            sx={{ background: tealGrad, textTransform: 'none', fontWeight: 600 }}>
            {actionLoading === 'publish' ? <CircularProgress size={20} /> : 'Publish & Get Link'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Schedule Dialog ── */}
      <Dialog open={scheduleOpen} onClose={() => setScheduleOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { background: '#1e293b', color: '#fff', borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Schedule Interviews</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'rgba(255,255,255,0.6)', mb: 2 }}>
            Set a start time and gap between interviews. Emails will be sent automatically.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="First Interview Start" type="datetime-local"
              value={schedData.start_time}
              onChange={e => setSchedData(p => ({ ...p, start_time: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
              }}
            />
            <TextField
              label="Gap Between Interviews (minutes)" type="number"
              value={schedData.gap_minutes}
              onChange={e => setSchedData(p => ({ ...p, gap_minutes: parseInt(e.target.value) || 45 }))}
              sx={{
                '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setScheduleOpen(false)} sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handleSchedule} variant="contained" disabled={actionLoading === 'schedule'}
            sx={{ background: tealGrad, textTransform: 'none', fontWeight: 600 }}>
            {actionLoading === 'schedule' ? <CircularProgress size={20} /> : 'Schedule & Send Emails'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={!!snackbar} autoHideDuration={5000} onClose={() => setSnackbar('')}
        message={snackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Box>
  );
}
