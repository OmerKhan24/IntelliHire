import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, IconButton, Chip, TextField, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Switch,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  LinearProgress, CircularProgress, Snackbar, Alert,
  Card, CardContent, Grid,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

import DashboardIcon from '@mui/icons-material/Dashboard';
import WorkIcon from '@mui/icons-material/Work';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import BrandingWatermarkIcon from '@mui/icons-material/BrandingWatermark';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import StorageIcon from '@mui/icons-material/Storage';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LogoutIcon from '@mui/icons-material/Logout';
import BarChartIcon from '@mui/icons-material/BarChart';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import StarIcon from '@mui/icons-material/Star';
import ScheduleIcon from '@mui/icons-material/Schedule';
import DownloadIcon from '@mui/icons-material/Download';

// Theme constants
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
const sectionTitle = {
  fontWeight: 700, fontSize: '1.1rem', color: C.text,
  mb: 2, display: 'flex', alignItems: 'center', gap: 1,
};
const tableHeaderCell = {
  color: C.textMuted, fontWeight: 700, fontSize: '.78rem',
  textTransform: 'uppercase', letterSpacing: '.06em',
  borderBottom: `1px solid ${C.border}`, py: 1.5,
};
const tableBodyCell = {
  color: C.text, borderBottom: `1px solid ${alpha(C.border, 0.5)}`, py: 1.5,
};
const statusChip = (color) => ({
  background: alpha(color, 0.15), color, fontWeight: 700, fontSize: '.75rem',
  border: `1px solid ${alpha(color, 0.3)}`,
});
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

const BASE_TABS = [
  { label: 'Overview', icon: <DashboardIcon /> },
  { label: 'Jobs', icon: <WorkIcon /> },
];
const CLIENT_TABS = [
  { label: 'Team', icon: <PeopleIcon /> },
  { label: 'Branding', icon: <BrandingWatermarkIcon /> },
];
const SETTINGS_TAB = { label: 'Settings', icon: <SettingsIcon /> };

const ClientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [toast, setToast] = useState({ open: false, msg: '', severity: 'success' });

  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  const [hasClientProfile, setHasClientProfile] = useState(false);
  const [profile, setProfile] = useState(null);
  const [subAccounts, setSubAccounts] = useState([]);
  const [preferences, setPreferences] = useState({});
  const [clientDashData, setClientDashData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [addMemberDialog, setAddMemberDialog] = useState({ open: false, email: '', full_name: '', role: 'member', password: '' });
  const [detailsDialog, setDetailsDialog] = useState({ open: false, job: null });
  const [candidatesDialog, setCandidatesDialog] = useState({ open: false, jobId: null, candidates: [], jobTitle: '' });
  const [passwordDialog, setPasswordDialog] = useState({ open: false, current: '', newPw: '', confirm: '' });

  const showToast = (msg, severity = 'success') => setToast({ open: true, msg, severity });

  const TABS = [...BASE_TABS, ...(hasClientProfile ? CLIENT_TABS : []), SETTINGS_TAB];

  useEffect(() => {
    if (!user || user.role !== 'interviewer') { navigate('/'); }
  }, [user, navigate]);

  useEffect(() => {
    loadJobs();
    tryLoadClientProfile();
  }, []);

  useEffect(() => {
    const tabLabel = TABS[tab]?.label;
    if (tabLabel === 'Jobs') loadJobs();
    else if (tabLabel === 'Team') loadTeam();
    else if (tabLabel === 'Settings') loadSettings();
  }, [tab]);

  const loadJobs = async () => {
    try {
      setJobsLoading(true);
      const r = await api.jobs.list();
      setJobs(r.data.jobs || []);
    } catch { showToast('Failed to load jobs', 'error'); }
    finally { setJobsLoading(false); }
  };

  const tryLoadClientProfile = async () => {
    try {
      const [dRes, pRes] = await Promise.all([
        api.clientPortal.getDashboard(),
        api.clientPortal.getProfile(),
      ]);
      setClientDashData(dRes.data);
      setProfile(pRes.data.profile || pRes.data);
      setHasClientProfile(true);
    } catch {
      setHasClientProfile(false);
    }
  };

  const loadTeam = async () => {
    try { const r = await api.clientPortal.getSubAccounts(); setSubAccounts(r.data.sub_accounts || []); }
    catch { /* no client record */ }
  };

  const loadSettings = async () => {
    if (!hasClientProfile) return;
    try { const r = await api.clientPortal.getPreferences(); setPreferences(r.data.preferences || {}); }
    catch { /* ignore */ }
  };

  const calculateAverageScore = (interviews) => {
    if (!interviews || interviews.length === 0) return 0;
    const completed = interviews.filter(i => i.status === 'completed' && i.final_score);
    if (completed.length === 0) return 0;
    return (completed.reduce((s, i) => s + i.final_score, 0) / completed.length).toFixed(1);
  };

  const getJobStats = (job) => {
    const interviews = job.interviews || [];
    return {
      total: interviews.length,
      completed: interviews.filter(i => i.status === 'completed').length,
      inProgress: interviews.filter(i => i.status === 'in_progress').length,
      averageScore: calculateAverageScore(interviews),
    };
  };

  const totalCandidates = jobs.reduce((s, j) => s + (j.interviews?.length || 0), 0);
  const totalCompleted = jobs.reduce((s, j) => s + (j.interviews?.filter(i => i.status === 'completed').length || 0), 0);
  const overallAvg = (() => {
    const scored = jobs.filter(j => calculateAverageScore(j.interviews) > 0);
    if (!scored.length) return '0.0';
    return (scored.reduce((s, j) => s + parseFloat(calculateAverageScore(j.interviews)), 0) / scored.length).toFixed(1);
  })();

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-';

  const handleViewDetails = async (jobId) => {
    try {
      const r = await api.jobs.get(jobId);
      setDetailsDialog({ open: true, job: r.data.job });
    } catch { showToast('Failed to load details', 'error'); }
  };

  const handleViewCandidates = async (jobId, jobTitle) => {
    try {
      const r = await api.jobs.getCandidates(jobId);
      setCandidatesDialog({ open: true, jobId, candidates: r.data.candidates || r.data.interviews || [], jobTitle });
    } catch { showToast('Failed to load candidates', 'error'); }
  };

  const handleAddMember = async () => {
    setLoading(true);
    try {
      await api.clientPortal.createSubAccount(addMemberDialog);
      showToast('Team member added');
      setAddMemberDialog({ open: false, email: '', full_name: '', role: 'member', password: '' });
      loadTeam();
    } catch (e) { showToast(e.response?.data?.error || 'Failed to add member', 'error'); }
    finally { setLoading(false); }
  };

  const handleRemoveMember = async (id) => {
    try { await api.clientPortal.removeSubAccount(id); showToast('Member removed'); loadTeam(); }
    catch { showToast('Failed to remove member', 'error'); }
  };

  const handleUpdatePrefs = async (key, val) => {
    const updated = { ...preferences, [key]: val };
    setPreferences(updated);
    try { await api.clientPortal.updatePreferences(updated); }
    catch { showToast('Failed to save', 'error'); }
  };

  const handleBrandingUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('logo', file);
    try {
      await api.clientPortal.updateBranding(fd);
      showToast('Logo updated');
      tryLoadClientProfile();
    } catch (e) { showToast(e.response?.data?.error || 'Upload failed', 'error'); }
  };

  const handleChangePassword = async () => {
    if (passwordDialog.newPw !== passwordDialog.confirm) {
      showToast('Passwords do not match', 'error'); return;
    }
    try {
      await api.clientPortal.changePassword({
        current_password: passwordDialog.current,
        new_password: passwordDialog.newPw,
      });
      showToast('Password changed');
      setPasswordDialog({ open: false, current: '', newPw: '', confirm: '' });
    } catch (e) { showToast(e.response?.data?.error || 'Failed', 'error'); }
  };

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };
  const handleExportPdf = async (candidateId, name) => {
    try { const r = await api.clientPortal.exportCandidatePdf(candidateId); downloadBlob(r.data, (name || 'candidate')+'_report.pdf'); }
    catch { showToast('Export failed', 'error'); }
  };
  const handleExportCsv = async (jobId, title) => {
    try { const r = await api.clientPortal.exportCandidatesCsv(jobId); downloadBlob(r.data, (title || 'candidates')+'.csv'); }
    catch { showToast('Export failed', 'error'); }
  };
  const handleExportZip = async (jobId, title) => {
    try { const r = await api.clientPortal.exportCandidatesZip(jobId); downloadBlob(r.data, (title || 'reports')+'.zip'); }
    catch { showToast('Export failed', 'error'); }
  };
  const handleExportUsage = async () => {
    try { const r = await api.clientPortal.exportUsage(); downloadBlob(r.data, 'usage_report.csv'); }
    catch { showToast('Export failed', 'error'); }
  };

  const quotaUsed = clientDashData?.usage?.interviews_used || 0;
  const quotaMax = clientDashData?.usage?.interview_quota || 1;
  const quotaPct = Math.min(Math.round((quotaUsed / quotaMax) * 100), 100);
  const daysLeft = clientDashData?.subscription?.days_remaining;
  const dataExpiring = clientDashData?.data_expiring || [];

  // ── Tab Renders ────────────────────────────────────────

  const renderOverview = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Grid container spacing={2.5}>
        {[
          { label: 'Total Jobs', value: jobs.length, icon: <WorkIcon />, color: C.primary },
          { label: 'Total Candidates', value: totalCandidates, icon: <PeopleIcon />, color: C.success },
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

      {hasClientProfile && (
        <Card sx={{ ...glassCardStatic, p: 3 }}>
          <Typography sx={sectionTitle}><BarChartIcon sx={{ color: C.primary }} /> Interview Quota</Typography>
          <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ color: C.text, fontWeight: 600 }}>{quotaUsed} used</Typography>
            <Typography sx={{ color: C.textMuted }}>{quotaMax} total</Typography>
          </Box>
          <LinearProgress variant="determinate" value={quotaPct}
            sx={{
              height: 12, borderRadius: 6, bgcolor: alpha(C.primary, 0.12),
              '& .MuiLinearProgress-bar': {
                borderRadius: 6,
                background: quotaPct >= 80
                  ? `linear-gradient(90deg, ${C.warning}, ${C.error})`
                  : `linear-gradient(90deg, ${C.primary}, ${C.accent})`,  
              },
            }}
          />
          {quotaPct >= 80 && (
            <Alert severity="warning" sx={{ mt: 2, bgcolor: alpha(C.warning, 0.1), color: C.warning, border: `1px solid ${alpha(C.warning, 0.3)}`, '& .MuiAlert-icon': { color: C.warning } }}>
              You've used {quotaPct}% of your interview quota. Contact support to increase.
            </Alert>
          )}
        </Card>
      )}

      {hasClientProfile && clientDashData?.subscription && (
        <Card sx={{ ...glassCardStatic, p: 3 }}>
          <Typography sx={sectionTitle}><CalendarTodayIcon sx={{ color: C.primary }} /> Subscription</Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Typography sx={{ color: C.textMuted, fontSize: '.82rem' }}>Start Date</Typography>
              <Typography sx={{ color: C.text, fontWeight: 600 }}>{clientDashData.subscription.start ? formatDate(clientDashData.subscription.start) : '-'}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography sx={{ color: C.textMuted, fontSize: '.82rem' }}>End Date</Typography>
              <Typography sx={{ color: C.text, fontWeight: 600 }}>{clientDashData.subscription.end ? formatDate(clientDashData.subscription.end) : '-'}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography sx={{ color: C.textMuted, fontSize: '.82rem' }}>Days Remaining</Typography>
              <Typography sx={{ color: daysLeft <= 7 ? C.error : daysLeft <= 30 ? C.warning : C.success, fontWeight: 700, fontSize: '1.2rem' }}>
                {daysLeft ?? '-'}
              </Typography>
            </Grid>
          </Grid>
          {daysLeft !== undefined && daysLeft <= 7 && (
            <Alert severity="error" sx={{ mt: 2, bgcolor: alpha(C.error, 0.1), color: C.error, border: `1px solid ${alpha(C.error, 0.3)}`, '& .MuiAlert-icon': { color: C.error } }}>
              Your subscription expires in {daysLeft} day(s). Contact support to renew.
            </Alert>
          )}
        </Card>
      )}

      {dataExpiring.length > 0 && (
        <Card sx={{ ...glassCardStatic, p: 3, borderColor: alpha(C.warning, 0.3) }}>
          <Typography sx={sectionTitle}><WarningIcon sx={{ color: C.warning }} /> Data Expiring Soon</Typography>
          <Typography sx={{ color: C.textMuted, mb: 2, fontSize: '.9rem' }}>
            Export candidate data before it's deleted per your retention policy.
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={tableHeaderCell}>Candidate</TableCell>
                  <TableCell sx={tableHeaderCell}>Job</TableCell>
                  <TableCell sx={tableHeaderCell}>Expires</TableCell>
                  <TableCell sx={tableHeaderCell}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dataExpiring.map((d, i) => (
                  <TableRow key={i}>
                    <TableCell sx={tableBodyCell}>{d.candidate_name}</TableCell>
                    <TableCell sx={tableBodyCell}>{d.job_title}</TableCell>
                    <TableCell sx={tableBodyCell}><Chip label={d.expires_at} size="small" sx={statusChip(C.warning)} /></TableCell>
                    <TableCell sx={tableBodyCell}>
                      <Tooltip title="Export PDF">
                        <IconButton size="small" onClick={() => handleExportPdf(d.interview_id, d.candidate_name)} sx={{ color: C.primary }}>
                          <PictureAsPdfIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {hasClientProfile && (
        <Card sx={{ ...glassCardStatic, p: 3 }}>
          <Typography sx={sectionTitle}><DownloadIcon sx={{ color: C.primary }} /> Quick Export</Typography>
          <Button variant="outlined" startIcon={<TableChartIcon />} onClick={handleExportUsage}
            sx={{ color: C.text, borderColor: C.border, '&:hover': { borderColor: C.primary, bgcolor: alpha(C.primary, 0.08) } }}>
            Usage Report (CSV)
          </Button>
        </Card>
      )}
    </Box>
  );

  const renderJobs = () => (
    <Card sx={{ ...glassCardStatic, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography sx={sectionTitle}><WorkIcon sx={{ color: C.primary }} /> Your Jobs</Typography>
        <Button sx={primaryBtn} startIcon={<AddIcon />} onClick={() => navigate('/create-job')}>New Job</Button>
      </Box>
      {jobsLoading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress sx={{ color: C.primary }} /></Box>
      ) : jobs.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <WorkIcon sx={{ fontSize: 64, color: C.textDim, mb: 2 }} />
          <Typography sx={{ color: C.textMuted, mb: 2 }}>No jobs yet. Create your first job to get started.</Typography>
          <Button sx={primaryBtn} startIcon={<AddIcon />} onClick={() => navigate('/create-job')}>Create Your First Job</Button>
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
              {jobs.map(job => {
                const stats = getJobStats(job);
                const statusLabel = stats.inProgress > 0 ? 'Active' : stats.completed > 0 ? 'Complete' : 'Waiting';
                const statusColor = stats.inProgress > 0 ? C.warning : stats.completed > 0 ? C.success : C.textDim;
                return (
                  <TableRow key={job.id} sx={{ '&:hover': { bgcolor: alpha(C.primary, 0.03) } }}>
                    <TableCell sx={tableBodyCell}>
                      <Typography sx={{ fontWeight: 600, color: C.text }}>{job.title}</Typography>
                      <Typography sx={{ color: C.textDim, fontSize: '.8rem' }}>{job.description?.substring(0, 60)}...</Typography>
                    </TableCell>
                    <TableCell sx={tableBodyCell}>{formatDate(job.created_at)}</TableCell>
                    <TableCell sx={tableBodyCell}>{job.duration_minutes} min</TableCell>
                    <TableCell sx={tableBodyCell}>
                      <Box>
                        <Typography sx={{ color: C.text, fontSize: '.9rem', fontWeight: 600, mb: 0.5 }}>{stats.total} total</Typography>
                        <LinearProgress variant="determinate" value={stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}
                          sx={{ height: 6, borderRadius: 3, bgcolor: alpha(C.primary, 0.1), '& .MuiLinearProgress-bar': { borderRadius: 3, background: `linear-gradient(90deg, ${C.primary}, ${C.accent})` } }} />
                        <Typography sx={{ color: C.textDim, fontSize: '.75rem', mt: 0.3 }}>{stats.completed} completed</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={tableBodyCell}>
                      <Chip label={statusLabel} size="small" sx={statusChip(statusColor)} />
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
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Report">
                          <IconButton size="small" onClick={() => navigate('/report/'+job.id)} sx={{ color: C.success }}>
                            <AssessmentIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Applications">
                          <IconButton size="small" onClick={() => navigate('/applications/'+job.id)} sx={{ color: C.warning }}>
                            <PeopleIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {hasClientProfile && (
                          <>
                            <Tooltip title="Export CSV">
                              <IconButton size="small" onClick={() => handleExportCsv(job.id, job.title)} sx={{ color: '#8b5cf6' }}>
                                <TableChartIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Export All PDFs">
                              <IconButton size="small" onClick={() => handleExportZip(job.id, job.title)} sx={{ color: C.textMuted }}>
                                <FolderZipIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
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
  );

  const renderTeam = () => (
    <Card sx={{ ...glassCardStatic, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography sx={sectionTitle}><PeopleIcon sx={{ color: C.primary }} /> Team Members</Typography>
        <Button sx={primaryBtn} startIcon={<PersonAddIcon />}
          onClick={() => setAddMemberDialog({ open: true, email: '', full_name: '', role: 'member', password: '' })}>
          Add Member
        </Button>
      </Box>
      <Typography sx={{ color: C.textMuted, mb: 2, fontSize: '.85rem' }}>
        Max sub-accounts: {profile?.max_sub_accounts ?? 'N/A'} | Current: {subAccounts.length}
      </Typography>
      {subAccounts.length === 0 ? (
        <Typography sx={{ color: C.textMuted, textAlign: 'center', py: 3 }}>No team members yet.</Typography>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={tableHeaderCell}>Name</TableCell>
                <TableCell sx={tableHeaderCell}>Email</TableCell>
                <TableCell sx={tableHeaderCell}>Role</TableCell>
                <TableCell sx={tableHeaderCell}>Joined</TableCell>
                <TableCell sx={tableHeaderCell}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subAccounts.map(m => (
                <TableRow key={m.id}>
                  <TableCell sx={tableBodyCell}>{m.full_name || m.username}</TableCell>
                  <TableCell sx={tableBodyCell}>{m.email}</TableCell>
                  <TableCell sx={tableBodyCell}><Chip label={m.role} size="small" sx={statusChip(m.role === 'admin' ? C.warning : C.primary)} /></TableCell>
                  <TableCell sx={tableBodyCell}>{formatDate(m.created_at)}</TableCell>
                  <TableCell sx={tableBodyCell}>
                    {m.role !== 'owner' && (
                      <Tooltip title="Remove"><IconButton size="small" onClick={() => handleRemoveMember(m.id)} sx={{ color: C.error }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Card>
  );

  const renderBranding = () => (
    <Card sx={{ ...glassCardStatic, p: 3 }}>
      <Typography sx={sectionTitle}><BrandingWatermarkIcon sx={{ color: C.primary }} /> Company Branding</Typography>
      <Typography sx={{ color: C.textMuted, mb: 3, fontSize: '.9rem' }}>
        Upload your company logo to display on candidate interview screens.
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        {profile?.logo_url ? (
          <Box sx={{ width: 120, height: 120, borderRadius: '16px', border: '2px solid '+C.border, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#fff' }}>
            <img src={profile.logo_url} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          </Box>
        ) : (
          <Box sx={{ width: 120, height: 120, borderRadius: '16px', border: '2px dashed '+C.border, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CloudUploadIcon sx={{ fontSize: 48, color: C.textDim }} />
          </Box>
        )}
        <Box>
          <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />}
            sx={{ color: C.text, borderColor: C.border, '&:hover': { borderColor: C.primary, bgcolor: alpha(C.primary, 0.08) } }}>
            {profile?.logo_url ? 'Change Logo' : 'Upload Logo'}
            <input type="file" hidden accept="image/png,image/jpeg,image/svg+xml" onChange={handleBrandingUpload} />
          </Button>
          <Typography sx={{ color: C.textDim, fontSize: '.78rem', mt: 1 }}>PNG, JPEG, or SVG. Max 2 MB.</Typography>
        </Box>
      </Box>
    </Card>
  );

  const renderSettings = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {hasClientProfile && (
        <Card sx={{ ...glassCardStatic, p: 3 }}>
          <Typography sx={sectionTitle}><SettingsIcon sx={{ color: C.primary }} /> Notification Preferences</Typography>
          {[
            { key: 'notify_quota_80', label: 'Alert at 80% quota usage' },
            { key: 'notify_data_deletion', label: 'Alert before data retention deletion' },
            { key: 'notify_interview_complete', label: 'Email when an interview completes' },
          ].map(p => (
            <Box key={p.key} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: '1px solid '+alpha(C.border, 0.5) }}>
              <Typography sx={{ color: C.text, fontWeight: 500 }}>{p.label}</Typography>
              <Switch checked={!!preferences[p.key]} onChange={(e) => handleUpdatePrefs(p.key, e.target.checked)}
                sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: C.primary }, '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': { bgcolor: C.primary } }} />
            </Box>
          ))}
        </Card>
      )}

      {hasClientProfile && (
        <Card sx={{ ...glassCardStatic, p: 3 }}>
          <Typography sx={sectionTitle}><StorageIcon sx={{ color: C.primary }} /> Data Retention</Typography>
          <Typography sx={{ color: C.textMuted, mb: 2, fontSize: '.9rem' }}>Candidate data older than this period will be automatically deleted.</Typography>
          <TextField select value={preferences.data_retention_days || 365}
            onChange={(e) => handleUpdatePrefs('data_retention_days', parseInt(e.target.value))}
            size="small"
            sx={{
              width: 200,
              '& .MuiOutlinedInput-root': { color: C.text, '& fieldset': { borderColor: C.border }, '&:hover fieldset': { borderColor: C.primary } },
              '& .MuiSvgIcon-root': { color: C.textMuted },
            }}
            SelectProps={{ MenuProps: { PaperProps: { sx: { bgcolor: '#1a2332', color: C.text } } } }}>
            <MenuItem value={90}>90 days</MenuItem>
            <MenuItem value={180}>180 days</MenuItem>
            <MenuItem value={365}>1 year</MenuItem>
            <MenuItem value={730}>2 years</MenuItem>
          </TextField>
        </Card>
      )}

      <Card sx={{ ...glassCardStatic, p: 3 }}>
        <Typography sx={sectionTitle}>Change Password</Typography>
        <Button variant="outlined" onClick={() => setPasswordDialog({ open: true, current: '', newPw: '', confirm: '' })}
          sx={{ color: C.text, borderColor: C.border, '&:hover': { borderColor: C.primary, bgcolor: alpha(C.primary, 0.08) } }}>
          Change Password
        </Button>
      </Card>
    </Box>
  );

  const renderTab = () => {
    const label = TABS[tab]?.label;
    switch (label) {
      case 'Overview': return renderOverview();
      case 'Jobs': return renderJobs();
      case 'Team': return renderTeam();
      case 'Branding': return renderBranding();
      case 'Settings': return renderSettings();
      default: return null;
    }
  };

  const dialoqInputSx = {
    '& .MuiOutlinedInput-root': { color: C.text, '& fieldset': { borderColor: C.border }, '&:hover fieldset': { borderColor: C.primary }, '&.Mui-focused fieldset': { borderColor: C.primary } },
    '& .MuiInputLabel-root': { color: C.textMuted }, '& .MuiInputLabel-root.Mui-focused': { color: C.primary },
  };
  const dialogPaper = { bgcolor: '#0f1a2e', color: C.text, border: '1px solid '+C.border, borderRadius: '16px' };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: C.bg }}>
      {/* Sidebar */}
      <Box sx={{ width: 240, flexShrink: 0, bgcolor: 'rgba(0,0,0,0.2)', borderRight: '1px solid '+C.border, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 3, borderBottom: '1px solid '+C.border }}>
          <Typography sx={{ color: C.primary, fontWeight: 800, fontSize: '1.3rem' }}>IntelliHire</Typography>
          <Typography sx={{ color: C.textDim, fontSize: '.78rem', mt: 0.5 }}>Dashboard</Typography>
        </Box>
        <Box sx={{ flex: 1, py: 2 }}>
          {TABS.map((t, i) => (
            <Box
              key={i} onClick={() => setTab(i)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.5,
                px: 3, py: 1.5, cursor: 'pointer', mx: 1, borderRadius: '10px',
                color: tab === i ? C.primary : C.textMuted,
                bgcolor: tab === i ? alpha(C.primary, 0.1) : 'transparent',
                fontWeight: tab === i ? 700 : 500,
                transition: 'all 0.2s',
                '&:hover': { bgcolor: alpha(C.primary, 0.06), color: C.text },
              }}
            >
              {t.icon}
              <Typography sx={{ fontSize: '.9rem', fontWeight: 'inherit' }}>{t.label}</Typography>
            </Box>
          ))}
          <Box sx={{ mt: 2, mx: 1, pt: 2, borderTop: '1px solid '+C.border }}>
            <Box onClick={() => navigate('/create-job')}
              sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 3, py: 1.5, cursor: 'pointer', borderRadius: '10px',
                color: C.textMuted, '&:hover': { bgcolor: alpha(C.primary, 0.06), color: C.text } }}>
              <AddIcon />
              <Typography sx={{ fontSize: '.9rem' }}>Create Job</Typography>
            </Box>
            <Box onClick={() => navigate('/hr-assistant')}
              sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 3, py: 1.5, cursor: 'pointer', borderRadius: '10px',
                color: C.textMuted, '&:hover': { bgcolor: alpha(C.primary, 0.06), color: C.text } }}>
              <SmartToyIcon />
              <Typography sx={{ fontSize: '.9rem' }}>HR Assistant</Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ p: 2, borderTop: '1px solid '+C.border }}>
          <Typography sx={{ color: C.textDim, fontSize: '.75rem', mb: 0.5 }}>{user?.full_name || user?.username}</Typography>
          {profile?.company_name && <Typography sx={{ color: C.textDim, fontSize: '.7rem', mb: 1 }}>{profile.company_name}</Typography>}
          <Button size="small" startIcon={<LogoutIcon />} onClick={logout}
            sx={{ color: C.textMuted, textTransform: 'none', '&:hover': { color: C.error } }}>
            Logout
          </Button>
        </Box>
      </Box>

      {/* Main */}
      <Box sx={{ flex: 1, p: 4, overflow: 'auto' }}>
        <Typography sx={{ color: C.text, fontWeight: 800, fontSize: '1.8rem', mb: 0.5 }}>
          {TABS[tab]?.label}
        </Typography>
        <Typography sx={{ color: C.textMuted, mb: 3 }}>
          {TABS[tab]?.label === 'Overview' && 'Your account overview, stats, and subscription status'}
          {TABS[tab]?.label === 'Jobs' && 'Manage your interview jobs, view reports, and export data'}
          {TABS[tab]?.label === 'Team' && 'Manage team members with access to your account'}
          {TABS[tab]?.label === 'Branding' && 'Customize your company branding on interview screens'}
          {TABS[tab]?.label === 'Settings' && 'Notification preferences, data retention, and security'}
        </Typography>
        {renderTab()}
      </Box>

      {/* Job Details Dialog */}
      <Dialog open={detailsDialog.open} onClose={() => setDetailsDialog({ open: false, job: null })}
        maxWidth="md" fullWidth PaperProps={{ sx: dialogPaper }}>
        <DialogTitle sx={{ color: C.text, fontWeight: 700 }}>Job Details</DialogTitle>
        <DialogContent>
          {detailsDialog.job && (
            <Box>
              <Typography sx={{ color: C.text, fontWeight: 700, fontSize: '1.2rem', mb: 2 }}>{detailsDialog.job.title}</Typography>
              <Typography sx={{ color: C.textMuted, mb: 2 }}><strong style={{ color: C.text }}>Description:</strong> {detailsDialog.job.description}</Typography>
              {detailsDialog.job.requirements && (
                <Typography sx={{ color: C.textMuted, mb: 2 }}><strong style={{ color: C.text }}>Requirements:</strong> {detailsDialog.job.requirements}</Typography>
              )}
              <Typography sx={{ color: C.textMuted, mb: 2 }}><strong style={{ color: C.text }}>Duration:</strong> {detailsDialog.job.duration_minutes} minutes</Typography>

              <Typography sx={{ color: C.text, fontWeight: 600, mb: 1 }}>Interview Link:</Typography>
              <Box sx={{ p: 2, bgcolor: alpha(C.primary, 0.06), borderRadius: '10px', border: '1px solid '+C.border, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ color: C.textMuted, fontSize: '.9rem', wordBreak: 'break-all' }}>
                  {window.location.origin}/interview/{detailsDialog.job.id}
                </Typography>
                <Tooltip title="Copy Link">
                  <IconButton size="small" onClick={() => navigator.clipboard.writeText(window.location.origin+'/interview/'+detailsDialog.job.id)} sx={{ color: C.primary }}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              {detailsDialog.job.must_ask_questions && detailsDialog.job.must_ask_questions.length > 0 && (
                <>
                  <Typography sx={{ color: C.text, fontWeight: 700, fontSize: '1rem', mb: 1 }}>Must-Ask Questions</Typography>
                  {detailsDialog.job.must_ask_questions.map((q, i) => (
                    <Box key={i} sx={{ mb: 1, p: 1.5, bgcolor: alpha(C.warning, 0.06), borderRadius: '8px', border: '1px solid '+alpha(C.warning, 0.2) }}>
                      <Typography sx={{ color: C.text, fontSize: '.9rem' }}>{i + 1}. {q}</Typography>
                    </Box>
                  ))}
                </>
              )}

              <Typography sx={{ color: C.text, fontWeight: 700, fontSize: '1rem', mb: 1.5, mt: 2 }}>Scoring Criteria</Typography>
              {Object.entries(detailsDialog.job.scoring_criteria || {}).map(([key, criteria]) => (
                <Box key={key} sx={{ mb: 1, p: 1.5, bgcolor: alpha(C.primary, 0.04), borderRadius: '8px', border: '1px solid '+alpha(C.border, 0.5) }}>
                  <Typography sx={{ color: C.text, fontSize: '.9rem' }}>
                    <strong>{key.replace(/_/g, ' ').toUpperCase()}</strong>: {criteria.weight * 100}% - {criteria.description}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog({ open: false, job: null })} sx={{ color: C.textMuted }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Candidates Dialog */}
      <Dialog open={candidatesDialog.open} onClose={() => setCandidatesDialog(p => ({ ...p, open: false }))}
        PaperProps={{ sx: { ...dialogPaper, minWidth: 700 } }} maxWidth="md" fullWidth>
        <DialogTitle sx={{ color: C.text }}>Candidates - {candidatesDialog.jobTitle}</DialogTitle>
        <DialogContent>
          {candidatesDialog.candidates.length === 0 ? (
            <Typography sx={{ color: C.textMuted, textAlign: 'center', py: 3 }}>No candidates yet.</Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={tableHeaderCell}>Name</TableCell>
                    <TableCell sx={tableHeaderCell}>Email</TableCell>
                    <TableCell sx={tableHeaderCell}>Score</TableCell>
                    <TableCell sx={tableHeaderCell}>Status</TableCell>
                    {hasClientProfile && <TableCell sx={tableHeaderCell}>Export</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {candidatesDialog.candidates.map(c => (
                    <TableRow key={c.id}>
                      <TableCell sx={tableBodyCell}>{c.candidate_name || '-'}</TableCell>
                      <TableCell sx={tableBodyCell}>{c.candidate_email || '-'}</TableCell>
                      <TableCell sx={tableBodyCell}>
                        <Typography sx={{ color: (c.final_score || 0) >= 70 ? C.success : (c.final_score || 0) >= 40 ? C.warning : C.error, fontWeight: 700 }}>
                          {c.final_score?.toFixed(1) ?? '-'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={tableBodyCell}>
                        <Chip label={c.status} size="small" sx={statusChip(c.status === 'completed' ? C.success : c.status === 'in_progress' ? C.warning : C.textMuted)} />
                      </TableCell>
                      {hasClientProfile && (
                        <TableCell sx={tableBodyCell}>
                          <Tooltip title="Download PDF"><IconButton size="small" onClick={() => handleExportPdf(c.id, c.candidate_name)} sx={{ color: C.primary }}><PictureAsPdfIcon fontSize="small" /></IconButton></Tooltip>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          {hasClientProfile && (
            <>
              <Button onClick={() => handleExportCsv(candidatesDialog.jobId, candidatesDialog.jobTitle)} startIcon={<TableChartIcon />} sx={{ color: C.success }}>Export CSV</Button>
              <Button onClick={() => handleExportZip(candidatesDialog.jobId, candidatesDialog.jobTitle)} startIcon={<FolderZipIcon />} sx={{ color: C.warning }}>Export All PDFs</Button>
            </>
          )}
          <Button onClick={() => setCandidatesDialog(p => ({ ...p, open: false }))} sx={{ color: C.textMuted }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add Team Member */}
      <Dialog open={addMemberDialog.open} onClose={() => setAddMemberDialog(p => ({ ...p, open: false }))} PaperProps={{ sx: dialogPaper }}>
        <DialogTitle sx={{ color: C.text }}>Add Team Member</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField label="Full Name" value={addMemberDialog.full_name} onChange={e => setAddMemberDialog(p => ({ ...p, full_name: e.target.value }))} sx={dialoqInputSx} fullWidth />
          <TextField label="Email" type="email" value={addMemberDialog.email} onChange={e => setAddMemberDialog(p => ({ ...p, email: e.target.value }))} sx={dialoqInputSx} fullWidth />
          <TextField label="Temporary Password" type="password" value={addMemberDialog.password} onChange={e => setAddMemberDialog(p => ({ ...p, password: e.target.value }))} sx={dialoqInputSx} fullWidth />
          <TextField select label="Role" value={addMemberDialog.role} onChange={e => setAddMemberDialog(p => ({ ...p, role: e.target.value }))} sx={dialoqInputSx} fullWidth
            SelectProps={{ MenuProps: { PaperProps: { sx: { bgcolor: '#1a2332', color: C.text } } } }}>
            <MenuItem value="member">Member</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddMemberDialog(p => ({ ...p, open: false }))} sx={{ color: C.textMuted }}>Cancel</Button>
          <Button onClick={handleAddMember} disabled={loading || !addMemberDialog.email || !addMemberDialog.password} sx={primaryBtn}>
            {loading ? <CircularProgress size={20} /> : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password */}
      <Dialog open={passwordDialog.open} onClose={() => setPasswordDialog(p => ({ ...p, open: false }))} PaperProps={{ sx: dialogPaper }}>
        <DialogTitle sx={{ color: C.text }}>Change Password</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField label="Current Password" type="password" value={passwordDialog.current} onChange={e => setPasswordDialog(p => ({ ...p, current: e.target.value }))} sx={dialoqInputSx} fullWidth />
          <TextField label="New Password" type="password" value={passwordDialog.newPw} onChange={e => setPasswordDialog(p => ({ ...p, newPw: e.target.value }))} sx={dialoqInputSx} fullWidth />
          <TextField label="Confirm Password" type="password" value={passwordDialog.confirm} onChange={e => setPasswordDialog(p => ({ ...p, confirm: e.target.value }))} sx={dialoqInputSx} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(p => ({ ...p, open: false }))} sx={{ color: C.textMuted }}>Cancel</Button>
          <Button onClick={handleChangePassword} disabled={!passwordDialog.current || !passwordDialog.newPw} sx={primaryBtn}>Change</Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast(p => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={toast.severity} onClose={() => setToast(p => ({ ...p, open: false }))}
          sx={{ bgcolor: '#1a2332', color: C.text, border: '1px solid '+C.border }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ClientDashboard;
