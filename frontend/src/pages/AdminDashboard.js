import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Button, IconButton, Chip, TextField, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Switch,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  LinearProgress, CircularProgress, Snackbar, Alert,
  Card, CardContent, Grid, Divider, Select, FormControl,
  InputLabel
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

// ─── Icons ───────────────────────────────────────────────
import DashboardIcon from '@mui/icons-material/Dashboard';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DnsIcon from '@mui/icons-material/Dns';
import ApiIcon from '@mui/icons-material/Api';
import HistoryIcon from '@mui/icons-material/History';
import CampaignIcon from '@mui/icons-material/Campaign';
import SettingsIcon from '@mui/icons-material/Settings';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import SpeedIcon from '@mui/icons-material/Speed';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import BusinessIcon from '@mui/icons-material/Business';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import BlockIcon from '@mui/icons-material/Block';
import BuildIcon from '@mui/icons-material/Build';

// ─── Theme constants ─────────────────────────────────────
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

const TABS = [
  { label: 'Dashboard', icon: <DashboardIcon /> },
  { label: 'Leads', icon: <LeaderboardIcon /> },
  { label: 'Clients', icon: <PeopleIcon /> },
  { label: 'Revenue', icon: <AttachMoneyIcon /> },
  { label: 'Server Health', icon: <DnsIcon /> },
  { label: 'API Status', icon: <ApiIcon /> },
  { label: 'Audit Logs', icon: <HistoryIcon /> },
  { label: 'Announcements', icon: <CampaignIcon /> },
  { label: 'Settings', icon: <SettingsIcon /> },
];

const fmtBytes = (b) => {
  if (!b) return '0 B';
  const k = 1024, sizes = ['B','KB','MB','GB','TB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return (b / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
};
const fmtUptime = (s) => {
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [toast, setToast] = useState({ open: false, msg: '', severity: 'success' });

  const [dashboard, setDashboard] = useState(null);
  const [leads, setLeads] = useState([]);
  const [clients, setClients] = useState([]);
  const [payments, setPayments] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [health, setHealth] = useState(null);
  const [apiStatusData, setApiStatusData] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditPage, setAuditPage] = useState(1);
  const [announcements, setAnnouncements] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState({ open: false, lead: null, quota: 50, subscription_months: 12 });
  const [quotaDialog, setQuotaDialog] = useState({ open: false, client: null, addQuota: 10 });
  const [paymentDialog, setPaymentDialog] = useState({ open: false, clientId: '', amount: '', method: 'manual', ref: '', desc: '' });
  const [refundDialog, setRefundDialog] = useState({ open: false, paymentId: '', amount: '', reason: '' });
  const [announcementDialog, setAnnouncementDialog] = useState({ open: false, title: '', content: '', type: 'info' });
  const [alertDialog, setAlertDialog] = useState({ open: false, subject: 'System Alert — IntelliHire', message: '' });
  const [leadDetailDialog, setLeadDetailDialog] = useState({ open: false, lead: null });
  const [createClientDialog, setCreateClientDialog] = useState({ open: false, company_name: '', contact_name: '', email: '', plan: 'starter', quota: 50, password: '', subscription_months: 12 });

  const healthInterval = useRef(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); }
  }, [user, navigate]);

  useEffect(() => {
    const loaders = { 0: loadDashboard, 1: loadLeads, 2: loadClients, 3: loadRevenue,
      4: loadHealth, 5: loadApiStatus, 6: loadAuditLogs, 7: loadAnnouncements, 8: loadSettings };
    loaders[tab]?.();
    if (tab === 4) { healthInterval.current = setInterval(loadHealth, 30000); }
    else { clearInterval(healthInterval.current); }
    return () => clearInterval(healthInterval.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const showToast = (msg, severity = 'success') => setToast({ open: true, msg, severity });

  const loadDashboard = async () => { try { const r = await api.adminPanel.getDashboard(); setDashboard(r.data); } catch { showToast('Failed to load dashboard', 'error'); } };
  const loadLeads = async () => { try { const r = await api.adminPanel.getLeads(); setLeads(r.data.leads || []); } catch { showToast('Failed to load leads', 'error'); } };
  const loadClients = async () => { try { const r = await api.adminPanel.getClients(); setClients(r.data.clients || []); } catch { showToast('Failed to load clients', 'error'); } };
  const loadRevenue = async () => {
    try {
      const [pRes, rRes] = await Promise.all([api.adminPanel.getPayments(), api.adminPanel.getRefunds()]);
      setPayments(pRes.data.payments || []); setTotalRevenue(pRes.data.total_revenue || 0);
      setRefunds(rRes.data.refunds || []);
    } catch { showToast('Failed to load revenue', 'error'); }
  };
  const loadHealth = async () => { try { const r = await api.adminPanel.getHealth(); setHealth(r.data); } catch {} };
  const loadApiStatus = async () => { try { const r = await api.adminPanel.getApiStatus(); setApiStatusData(r.data.apis || []); } catch { showToast('Failed to load API status', 'error'); } };
  const loadAuditLogs = async (p = 1) => {
    try { const r = await api.adminPanel.getAuditLogs(p, 30); setAuditLogs(r.data.logs || []); setAuditTotal(r.data.total || 0); setAuditPage(r.data.page || 1); }
    catch { showToast('Failed to load audit logs', 'error'); }
  };
  const loadAnnouncements = async () => { try { const r = await api.adminPanel.getAnnouncements(); setAnnouncements(r.data.announcements || []); } catch { showToast('Failed to load announcements', 'error'); } };
  const loadSettings = async () => { try { const r = await api.adminPanel.getSettings(); setSettings(r.data.settings || {}); } catch { showToast('Failed to load settings', 'error'); } };

  const handleUpdateLeadStatus = async (id, status) => {
    try { await api.adminPanel.updateLead(id, { status }); showToast(`Lead → ${status}`); loadLeads(); if (tab === 0) loadDashboard(); }
    catch { showToast('Failed', 'error'); }
  };
  const handleConfirmLead = async () => {
    if (!confirmDialog.lead) return; setLoading(true);
    try {
      await api.adminPanel.confirmLead(confirmDialog.lead.id, { tier: confirmDialog.lead.selected_plan, interview_quota: confirmDialog.quota || 50, subscription_months: confirmDialog.subscription_months || 12 });
      showToast(`Credentials sent to ${confirmDialog.lead.work_email}`);
      setConfirmDialog({ open: false, lead: null, quota: 50, subscription_months: 12 }); loadLeads();
    } catch (e) { showToast(e.response?.data?.error || 'Failed', 'error'); }
    finally { setLoading(false); }
  };
  const handleCreateClient = async () => {
    setLoading(true);
    try {
      const r = await api.adminPanel.createClient(createClientDialog);
      showToast(`Client created. Temp password: ${r.data.credentials?.temporary_password || 'sent'}`);
      setCreateClientDialog({ open: false, company_name: '', contact_name: '', email: '', plan: 'starter', quota: 50, password: '', subscription_months: 12 });
      loadClients();
    } catch (e) { showToast(e.response?.data?.error || 'Failed', 'error'); }
    finally { setLoading(false); }
  };
  const handleUpdateQuota = async () => {
    if (!quotaDialog.client) return;
    try { await api.adminPanel.updateClientQuota(quotaDialog.client.id, { add_quota: parseInt(quotaDialog.addQuota) });
      showToast(`+${quotaDialog.addQuota} interviews`); setQuotaDialog({ open: false, client: null, addQuota: 10 }); loadClients();
    } catch { showToast('Failed', 'error'); }
  };
  const handleRecordPayment = async () => {
    try { await api.adminPanel.recordPayment({ client_id: parseInt(paymentDialog.clientId), amount: parseFloat(paymentDialog.amount),
      payment_method: paymentDialog.method, payment_ref: paymentDialog.ref, description: paymentDialog.desc });
      showToast('Payment recorded'); setPaymentDialog({ open: false, clientId: '', amount: '', method: 'manual', ref: '', desc: '' }); loadRevenue();
    } catch (e) { showToast(e.response?.data?.error || 'Failed', 'error'); }
  };
  const handleProcessRefund = async () => {
    try { await api.adminPanel.processRefund({ payment_id: parseInt(refundDialog.paymentId), amount: parseFloat(refundDialog.amount), reason: refundDialog.reason });
      showToast('Refund processed'); setRefundDialog({ open: false, paymentId: '', amount: '', reason: '' }); loadRevenue();
    } catch (e) { showToast(e.response?.data?.error || 'Failed', 'error'); }
  };
  const handleCreateAnnouncement = async () => {
    try { await api.adminPanel.createAnnouncement({ title: announcementDialog.title, content: announcementDialog.content, type: announcementDialog.type });
      showToast('Announcement created'); setAnnouncementDialog({ open: false, title: '', content: '', type: 'info' }); loadAnnouncements();
    } catch { showToast('Failed', 'error'); }
  };
  const handleDeleteAnnouncement = async (id) => {
    try { await api.adminPanel.deleteAnnouncement(id); showToast('Removed'); loadAnnouncements(); } catch { showToast('Failed', 'error'); }
  };
  const handleSosToggle = async (key) => {
    try { const r = await api.adminPanel.sosToggle(key); showToast(`${key.replace(/_/g, ' ')} → ${r.data.value}`); loadSettings(); }
    catch { showToast('Failed', 'error'); }
  };
  const handleSendAlertEmail = async () => {
    try { const r = await api.adminPanel.sosAlertEmail({ subject: alertDialog.subject, message: alertDialog.message });
      showToast(`Alert sent to ${r.data.sent_count} clients`); setAlertDialog({ open: false, subject: '', message: '' });
    } catch { showToast('Failed', 'error'); }
  };

  const statusColor = (s) => {
    const map = { new: C.primary, contacted: C.warning, confirmed: C.success, converted: '#8b5cf6', lost: C.error,
      completed: C.success, pending: C.warning, failed: C.error, refunded: '#f97316', processed: C.success,
      starter: '#3b82f6', professional: '#8b5cf6', enterprise: '#f59e0b' };
    return map[s] || C.textMuted;
  };

  // ═══════════════ TAB RENDERS ═══════════════════════════

  const renderDashboard = () => {
    if (!dashboard) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress sx={{ color: C.primary }} /></Box>;
    const s = dashboard.stats;
    const cards = [
      { label: 'New Leads', value: s.new_leads, icon: <LeaderboardIcon />, color: C.primary },
      { label: 'Total Clients', value: s.total_clients, icon: <PeopleIcon />, color: '#8b5cf6' },
      { label: 'Active Clients', value: s.active_clients, icon: <BusinessIcon />, color: C.success },
      { label: 'Net Revenue', value: `$${s.net_revenue?.toLocaleString()}`, icon: <AttachMoneyIcon />, color: '#f59e0b' },
      { label: 'Total Interviews', value: s.total_interviews, icon: <SpeedIcon />, color: '#ec4899' },
      { label: 'Active Now', value: s.active_interviews, icon: <FiberManualRecordIcon />, color: C.success },
    ];
    return (
      <Box>
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {cards.map((c, i) => (
            <Grid item xs={6} sm={4} md={2} key={i}>
              <Card sx={{ ...glassCard, p: 0, overflow: 'visible' }}>
                <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 42, height: 42, borderRadius: '12px', background: alpha(c.color, 0.15),
                      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {React.cloneElement(c.icon, { sx: { color: c.color, fontSize: 22 } })}
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: C.text, lineHeight: 1 }}>{c.value}</Typography>
                      <Typography sx={{ fontSize: '.72rem', color: C.textMuted, fontWeight: 600, mt: .3 }}>{c.label}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ ...glassCardStatic, p: 3 }}>
          <Typography sx={sectionTitle}><LeaderboardIcon sx={{ color: C.primary }} /> Recent Leads</Typography>
          <TableContainer><Table size="small"><TableHead><TableRow>
            {['Name','Company','Email','Plan','Status','Date'].map(h => <TableCell key={h} sx={tableHeaderCell}>{h}</TableCell>)}
          </TableRow></TableHead><TableBody>
            {(dashboard.recent_leads || []).map(l => (
              <TableRow key={l.id} sx={{ '&:hover': { background: alpha(C.primary, 0.04) } }}>
                <TableCell sx={tableBodyCell}>{l.full_name}</TableCell>
                <TableCell sx={tableBodyCell}>{l.company_name}</TableCell>
                <TableCell sx={tableBodyCell}>{l.work_email}</TableCell>
                <TableCell sx={tableBodyCell}><Chip label={l.selected_plan} size="small" sx={statusChip(statusColor(l.selected_plan))} /></TableCell>
                <TableCell sx={tableBodyCell}><Chip label={l.status} size="small" sx={statusChip(statusColor(l.status))} /></TableCell>
                <TableCell sx={{ ...tableBodyCell, color: C.textDim, fontSize: '.82rem' }}>{new Date(l.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody></Table></TableContainer>
        </Box>
      </Box>
    );
  };

  const renderLeads = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography sx={{ ...sectionTitle, mb: 0 }}><LeaderboardIcon sx={{ color: C.primary }} /> All Leads ({leads.length})</Typography>
        <Button onClick={loadLeads} startIcon={<RefreshIcon />} sx={{ color: C.textMuted, textTransform: 'none' }}>Refresh</Button>
      </Box>
      <Box sx={{ ...glassCardStatic, overflow: 'hidden' }}>
        <TableContainer><Table size="small"><TableHead><TableRow>
          {['Name','Company','Email','Phone','Plan','Status','Date','Actions'].map(h => <TableCell key={h} sx={tableHeaderCell}>{h}</TableCell>)}
        </TableRow></TableHead><TableBody>
          {leads.map(l => (
            <TableRow key={l.id} sx={{ '&:hover': { background: alpha(C.primary, 0.04) } }}>
              <TableCell sx={tableBodyCell}>{l.full_name}</TableCell>
              <TableCell sx={tableBodyCell}>{l.company_name}</TableCell>
              <TableCell sx={{ ...tableBodyCell, fontSize: '.82rem' }}>{l.work_email}</TableCell>
              <TableCell sx={{ ...tableBodyCell, fontSize: '.82rem' }}>{l.phone}</TableCell>
              <TableCell sx={tableBodyCell}><Chip label={l.selected_plan} size="small" sx={statusChip(statusColor(l.selected_plan))} /></TableCell>
              <TableCell sx={tableBodyCell}><Chip label={l.status} size="small" sx={statusChip(statusColor(l.status))} /></TableCell>
              <TableCell sx={{ ...tableBodyCell, color: C.textDim, fontSize: '.82rem' }}>{new Date(l.created_at).toLocaleDateString()}</TableCell>
              <TableCell sx={tableBodyCell}>
                <Box sx={{ display: 'flex', gap: .5 }}>
                  <Tooltip title="View"><IconButton size="small" sx={{ color: C.primary }} onClick={() => setLeadDetailDialog({ open: true, lead: l })}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
                  {l.status === 'new' && <Tooltip title="Mark Contacted"><IconButton size="small" sx={{ color: C.warning }} onClick={() => handleUpdateLeadStatus(l.id, 'contacted')}><EditIcon fontSize="small" /></IconButton></Tooltip>}
                  {(l.status === 'new' || l.status === 'contacted') && <Tooltip title="Confirm"><IconButton size="small" sx={{ color: C.success }} onClick={() => setConfirmDialog({ open: true, lead: l, quota: 50 })}><CheckCircleIcon fontSize="small" /></IconButton></Tooltip>}
                  {l.status !== 'converted' && l.status !== 'lost' && <Tooltip title="Lost"><IconButton size="small" sx={{ color: C.error }} onClick={() => handleUpdateLeadStatus(l.id, 'lost')}><BlockIcon fontSize="small" /></IconButton></Tooltip>}
                </Box>
              </TableCell>
            </TableRow>
          ))}
          {leads.length === 0 && <TableRow><TableCell colSpan={8} sx={{ ...tableBodyCell, textAlign: 'center', py: 6, color: C.textDim }}>No leads yet.</TableCell></TableRow>}
        </TableBody></Table></TableContainer>
      </Box>
    </Box>
  );

  const renderClients = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography sx={{ ...sectionTitle, mb: 0 }}><PeopleIcon sx={{ color: C.primary }} /> Active Clients ({clients.length})</Typography>
        <Button sx={primaryBtn} startIcon={<AddIcon />} onClick={() => setCreateClientDialog({ open: true, company_name: '', contact_name: '', email: '', plan: 'starter', quota: 50, password: '', subscription_months: 12 })}>Add Client</Button>
      </Box>
      <Box sx={{ ...glassCardStatic, overflow: 'hidden' }}>
        <TableContainer><Table size="small"><TableHead><TableRow>
          {['Company','Contact','Tier','Quota','Used','Remaining','Status','Actions'].map(h => <TableCell key={h} sx={tableHeaderCell}>{h}</TableCell>)}
        </TableRow></TableHead><TableBody>
          {clients.map(c => {
            const rem = c.interview_quota - c.interviews_used;
            const pct = c.interview_quota > 0 ? (c.interviews_used / c.interview_quota) * 100 : 0;
            return (
              <TableRow key={c.id} sx={{ '&:hover': { background: alpha(C.primary, 0.04) } }}>
                <TableCell sx={tableBodyCell}><Typography sx={{ fontWeight: 700, fontSize: '.9rem' }}>{c.company_name}</Typography><Typography sx={{ fontSize: '.75rem', color: C.textDim }}>{c.user_email}</Typography></TableCell>
                <TableCell sx={tableBodyCell}>{c.user_name || '—'}</TableCell>
                <TableCell sx={tableBodyCell}><Chip label={c.tier} size="small" sx={statusChip(statusColor(c.tier))} /></TableCell>
                <TableCell sx={tableBodyCell}>{c.interview_quota}</TableCell>
                <TableCell sx={tableBodyCell}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontSize: '.85rem' }}>{c.interviews_used}</Typography>
                    <LinearProgress variant="determinate" value={Math.min(pct, 100)} sx={{ width: 60, height: 6, borderRadius: 3, background: alpha(C.textDim, 0.2),
                      '& .MuiLinearProgress-bar': { background: pct > 90 ? C.error : pct > 70 ? C.warning : C.success, borderRadius: 3 } }} />
                  </Box>
                </TableCell>
                <TableCell sx={{ ...tableBodyCell, fontWeight: 700, color: rem <= 5 ? C.error : C.success }}>{rem}</TableCell>
                <TableCell sx={tableBodyCell}><Chip label={c.is_active ? 'Active' : 'Inactive'} size="small" sx={statusChip(c.is_active ? C.success : C.error)} /></TableCell>
                <TableCell sx={tableBodyCell}><Tooltip title="Add Quota"><IconButton size="small" sx={{ color: C.primary }} onClick={() => setQuotaDialog({ open: true, client: c, addQuota: 10 })}><AddIcon fontSize="small" /></IconButton></Tooltip></TableCell>
              </TableRow>
            );
          })}
          {clients.length === 0 && <TableRow><TableCell colSpan={8} sx={{ ...tableBodyCell, textAlign: 'center', py: 6, color: C.textDim }}>No clients yet. Confirm a lead first.</TableCell></TableRow>}
        </TableBody></Table></TableContainer>
      </Box>
    </Box>
  );

  const renderRevenue = () => {
    const totalRefunded = refunds.filter(r => r.status === 'processed').reduce((s, r) => s + r.amount, 0);
    return (
      <Box>
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          {[
            { label: 'Total Collected', value: `$${totalRevenue.toLocaleString()}`, color: C.success, icon: <AttachMoneyIcon /> },
            { label: 'Total Refunded', value: `$${totalRefunded.toLocaleString()}`, color: C.error, icon: <ReceiptLongIcon /> },
            { label: 'Net Revenue', value: `$${(totalRevenue - totalRefunded).toLocaleString()}`, color: C.primary, icon: <TrendingUpIcon /> },
          ].map((c, i) => (
            <Grid item xs={12} sm={4} key={i}>
              <Card sx={{ ...glassCard, p: 0 }}>
                <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, '&:last-child': { pb: 3 } }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: '14px', background: alpha(c.color, 0.15), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {React.cloneElement(c.icon, { sx: { color: c.color, fontSize: 26 } })}
                  </Box>
                  <Box><Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: C.text }}>{c.value}</Typography><Typography sx={{ fontSize: '.78rem', color: C.textMuted, fontWeight: 600 }}>{c.label}</Typography></Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={7}>
            <Box sx={{ ...glassCardStatic, p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ ...sectionTitle, mb: 0 }}><AttachMoneyIcon sx={{ color: C.success }} /> Payments</Typography>
                <Button size="small" startIcon={<AddIcon />} sx={primaryBtn} onClick={() => setPaymentDialog({ ...paymentDialog, open: true })}>Record Payment</Button>
              </Box>
              <TableContainer sx={{ maxHeight: 400 }}><Table size="small" stickyHeader><TableHead><TableRow>
                {['Client','Amount','Method','Status','Date','Actions'].map(h => <TableCell key={h} sx={{ ...tableHeaderCell, background: C.bgCard }}>{h}</TableCell>)}
              </TableRow></TableHead><TableBody>
                {payments.map(p => (
                  <TableRow key={p.id}>
                    <TableCell sx={tableBodyCell}>{p.client_name}</TableCell>
                    <TableCell sx={{ ...tableBodyCell, fontWeight: 700 }}>${p.amount}</TableCell>
                    <TableCell sx={tableBodyCell}>{p.payment_method}</TableCell>
                    <TableCell sx={tableBodyCell}><Chip label={p.status} size="small" sx={statusChip(statusColor(p.status))} /></TableCell>
                    <TableCell sx={{ ...tableBodyCell, fontSize: '.82rem', color: C.textDim }}>{p.paid_at ? new Date(p.paid_at).toLocaleDateString() : '—'}</TableCell>
                    <TableCell sx={tableBodyCell}>{p.status === 'completed' && <Tooltip title="Refund"><IconButton size="small" sx={{ color: C.warning }} onClick={() => setRefundDialog({ open: true, paymentId: p.id, amount: p.amount, reason: '' })}><ReceiptLongIcon fontSize="small" /></IconButton></Tooltip>}</TableCell>
                  </TableRow>
                ))}
              </TableBody></Table></TableContainer>
            </Box>
          </Grid>
          <Grid item xs={12} md={5}>
            <Box sx={{ ...glassCardStatic, p: 3 }}>
              <Typography sx={sectionTitle}><ReceiptLongIcon sx={{ color: C.error }} /> Refunds</Typography>
              <TableContainer sx={{ maxHeight: 400 }}><Table size="small"><TableHead><TableRow>
                {['Client','Amount','Reason','Status','Date'].map(h => <TableCell key={h} sx={{ ...tableHeaderCell, background: C.bgCard }}>{h}</TableCell>)}
              </TableRow></TableHead><TableBody>
                {refunds.map(r => (
                  <TableRow key={r.id}>
                    <TableCell sx={tableBodyCell}>{r.client_name}</TableCell>
                    <TableCell sx={{ ...tableBodyCell, fontWeight: 700, color: C.error }}>${r.amount}</TableCell>
                    <TableCell sx={{ ...tableBodyCell, fontSize: '.82rem', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.reason}</TableCell>
                    <TableCell sx={tableBodyCell}><Chip label={r.status} size="small" sx={statusChip(statusColor(r.status))} /></TableCell>
                    <TableCell sx={{ ...tableBodyCell, fontSize: '.82rem', color: C.textDim }}>{new Date(r.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {refunds.length === 0 && <TableRow><TableCell colSpan={5} sx={{ ...tableBodyCell, textAlign: 'center', py: 4, color: C.textDim }}>No refunds</TableCell></TableRow>}
              </TableBody></Table></TableContainer>
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderHealth = () => {
    if (!health) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress sx={{ color: C.primary }} /></Box>;
    const sv = health.server, as = health.active_sessions;
    const GaugeCircle = ({ value, label, color }) => (
      <Box sx={{ textAlign: 'center' }}>
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <CircularProgress variant="determinate" value={value} size={100} thickness={6}
            sx={{ color, '& .MuiCircularProgress-circle': { strokeLinecap: 'round', filter: `drop-shadow(0 0 8px ${alpha(color, 0.4)})` } }} />
          <CircularProgress variant="determinate" value={100} size={100} thickness={6} sx={{ color: alpha(color, 0.12), position: 'absolute', left: 0 }} />
          <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: C.text }}>{Math.round(value)}%</Typography>
          </Box>
        </Box>
        <Typography sx={{ mt: 1, fontSize: '.82rem', color: C.textMuted, fontWeight: 600 }}>{label}</Typography>
      </Box>
    );
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography sx={{ ...sectionTitle, mb: 0 }}><DnsIcon sx={{ color: C.primary }} /> Server Metrics
            <Chip label="Live" size="small" sx={{ ml: 1, ...statusChip(C.success) }} icon={<FiberManualRecordIcon sx={{ fontSize: 10, color: `${C.success} !important` }} />} />
          </Typography>
          <Typography sx={{ color: C.textDim, fontSize: '.8rem' }}>Auto-refreshing every 30s</Typography>
        </Box>
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid item xs={12} md={5}>
            <Card sx={{ ...glassCardStatic, p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                <GaugeCircle value={sv.cpu_percent} label="CPU" color={sv.cpu_percent > 80 ? C.error : sv.cpu_percent > 50 ? C.warning : C.success} />
                <GaugeCircle value={sv.ram_percent} label="RAM" color={sv.ram_percent > 85 ? C.error : sv.ram_percent > 60 ? C.warning : C.primary} />
                <GaugeCircle value={sv.disk_percent} label="Disk" color={sv.disk_percent > 90 ? C.error : sv.disk_percent > 70 ? C.warning : C.accent} />
              </Box>
              <Box sx={{ mt: 2.5, display: 'flex', justifyContent: 'space-around' }}>
                <Box sx={{ textAlign: 'center' }}><Typography sx={{ fontSize: '.72rem', color: C.textDim }}>RAM</Typography><Typography sx={{ fontSize: '.82rem', color: C.text, fontWeight: 600 }}>{fmtBytes(sv.ram_used)} / {fmtBytes(sv.ram_total)}</Typography></Box>
                <Box sx={{ textAlign: 'center' }}><Typography sx={{ fontSize: '.72rem', color: C.textDim }}>Disk</Typography><Typography sx={{ fontSize: '.82rem', color: C.text, fontWeight: 600 }}>{fmtBytes(sv.disk_used)} / {fmtBytes(sv.disk_total)}</Typography></Box>
                <Box sx={{ textAlign: 'center' }}><Typography sx={{ fontSize: '.72rem', color: C.textDim }}>Uptime</Typography><Typography sx={{ fontSize: '.82rem', color: C.text, fontWeight: 600 }}>{fmtUptime(sv.uptime_seconds)}</Typography></Box>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={7}>
            <Card sx={{ ...glassCardStatic, p: 3, height: '100%' }}>
              <Typography sx={sectionTitle}><SpeedIcon sx={{ color: C.accent }} /> Active Sessions <Chip label={as.count} size="small" sx={{ ml: 1, ...statusChip(C.success) }} /></Typography>
              {as.sessions.length > 0 ? (
                <TableContainer><Table size="small"><TableHead><TableRow>
                  {['ID','Started','Client'].map(h => <TableCell key={h} sx={tableHeaderCell}>{h}</TableCell>)}
                </TableRow></TableHead><TableBody>
                  {as.sessions.map(s => (
                    <TableRow key={s.interview_id}><TableCell sx={tableBodyCell}>#{s.interview_id}</TableCell><TableCell sx={{ ...tableBodyCell, fontSize: '.82rem' }}>{s.started_at ? new Date(s.started_at).toLocaleString() : '—'}</TableCell><TableCell sx={tableBodyCell}>{s.client_name}</TableCell></TableRow>
                  ))}
                </TableBody></Table></TableContainer>
              ) : <Box sx={{ py: 4, textAlign: 'center', color: C.textDim }}>No active sessions right now.</Box>}
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderApiStatus = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography sx={{ ...sectionTitle, mb: 0 }}><ApiIcon sx={{ color: C.primary }} /> Third-Party APIs</Typography>
        <Button onClick={loadApiStatus} startIcon={<RefreshIcon />} sx={{ color: C.textMuted, textTransform: 'none' }}>Re-check</Button>
      </Box>
      <Grid container spacing={2.5}>
        {apiStatusData.map((a, i) => {
          const isOp = a.status === 'operational', isDeg = a.status === 'degraded';
          const color = isOp ? C.success : isDeg ? C.warning : C.error;
          const Icon = isOp ? CheckCircleIcon : isDeg ? WarningIcon : ErrorIcon;
          return (
            <Grid item xs={12} sm={4} key={i}>
              <Card sx={{ ...glassCard, p: 0, borderColor: alpha(color, 0.3) }}>
                <CardContent sx={{ p: 3, textAlign: 'center', '&:last-child': { pb: 3 } }}>
                  <Icon sx={{ fontSize: 40, color, mb: 1, filter: `drop-shadow(0 0 10px ${alpha(color, 0.4)})` }} />
                  <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: C.text, mb: .5 }}>{a.name}</Typography>
                  <Chip label={a.status} size="small" sx={{ ...statusChip(color), mb: 1.5 }} />
                  {a.response_time_ms != null && <Typography sx={{ fontSize: '.78rem', color: C.textDim }}>Response: {a.response_time_ms}ms</Typography>}
                  <Typography sx={{ fontSize: '.72rem', color: C.textDim, mt: .5 }}>Checked: {a.last_checked ? new Date(a.last_checked).toLocaleTimeString() : '—'}</Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );

  const renderAuditLogs = () => (
    <Box>
      <Typography sx={sectionTitle}><HistoryIcon sx={{ color: C.primary }} /> Audit Logs ({auditTotal})</Typography>
      <Box sx={{ ...glassCardStatic, overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 500 }}><Table size="small" stickyHeader><TableHead><TableRow>
          {['User','Action','Entity','IP','Time'].map(h => <TableCell key={h} sx={{ ...tableHeaderCell, background: C.bgCard }}>{h}</TableCell>)}
        </TableRow></TableHead><TableBody>
          {auditLogs.map(l => (
            <TableRow key={l.id} sx={{ '&:hover': { background: alpha(C.primary, 0.04) } }}>
              <TableCell sx={tableBodyCell}>{l.user_name || `User #${l.user_id}`}</TableCell>
              <TableCell sx={tableBodyCell}><Chip label={l.action} size="small" sx={{ background: alpha(C.primary, 0.12), color: C.primary, fontWeight: 600, fontSize: '.72rem' }} /></TableCell>
              <TableCell sx={{ ...tableBodyCell, fontSize: '.82rem', color: C.textDim }}>{l.entity_type ? `${l.entity_type} #${l.entity_id || ''}` : '—'}</TableCell>
              <TableCell sx={{ ...tableBodyCell, fontFamily: 'monospace', fontSize: '.78rem', color: C.textDim }}>{l.ip_address || '—'}</TableCell>
              <TableCell sx={{ ...tableBodyCell, fontSize: '.78rem', color: C.textDim }}>{new Date(l.created_at).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody></Table></TableContainer>
        {auditTotal > 30 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, py: 2 }}>
            <Button disabled={auditPage <= 1} onClick={() => loadAuditLogs(auditPage - 1)} sx={{ color: C.textMuted, textTransform: 'none' }}>Prev</Button>
            <Typography sx={{ color: C.textDim, alignSelf: 'center', fontSize: '.85rem' }}>Page {auditPage}</Typography>
            <Button onClick={() => loadAuditLogs(auditPage + 1)} sx={{ color: C.textMuted, textTransform: 'none' }}>Next</Button>
          </Box>
        )}
      </Box>
    </Box>
  );

  const renderAnnouncements = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography sx={{ ...sectionTitle, mb: 0 }}><CampaignIcon sx={{ color: C.primary }} /> Announcements</Typography>
        <Button startIcon={<AddIcon />} sx={primaryBtn} onClick={() => setAnnouncementDialog({ open: true, title: '', content: '', type: 'info' })}>New</Button>
      </Box>
      <Grid container spacing={2}>
        {announcements.map(a => {
          const colors = { info: C.primary, warning: C.warning, maintenance: C.error, update: C.success };
          const color = colors[a.type] || C.primary;
          return (
            <Grid item xs={12} sm={6} key={a.id}>
              <Card sx={{ ...glassCard, borderLeft: `3px solid ${color}`, opacity: a.is_active ? 1 : 0.5 }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Chip label={a.type} size="small" sx={{ ...statusChip(color), mb: 1 }} />
                      <Typography sx={{ fontWeight: 700, color: C.text, mb: .5 }}>{a.title}</Typography>
                      <Typography sx={{ fontSize: '.85rem', color: C.textMuted, lineHeight: 1.6 }}>{a.content}</Typography>
                    </Box>
                    <IconButton size="small" sx={{ color: C.error }} onClick={() => handleDeleteAnnouncement(a.id)}><DeleteIcon fontSize="small" /></IconButton>
                  </Box>
                  <Typography sx={{ fontSize: '.72rem', color: C.textDim, mt: 1 }}>By {a.creator_name} • {new Date(a.created_at).toLocaleDateString()}</Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
        {announcements.length === 0 && <Grid item xs={12}><Box sx={{ ...glassCardStatic, p: 4, textAlign: 'center', color: C.textDim }}>No announcements yet.</Box></Grid>}
      </Grid>
    </Box>
  );

  const renderSettings = () => {
    const boolVal = (k) => settings[k] === 'true';
    const SosToggle = ({ label, settingKey, icon, danger }) => (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderRadius: '12px',
        border: `1px solid ${danger ? alpha(C.error, 0.3) : C.border}`, background: danger ? alpha(C.error, 0.04) : 'transparent', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {icon}
          <Box><Typography sx={{ fontWeight: 600, color: C.text, fontSize: '.9rem' }}>{label}</Typography>
            <Typography sx={{ fontSize: '.75rem', color: C.textDim }}>Currently: {boolVal(settingKey) ? 'ON' : 'OFF'}</Typography></Box>
        </Box>
        <Switch checked={boolVal(settingKey)} onChange={() => handleSosToggle(settingKey)}
          sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: danger ? C.error : C.primary },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: danger ? C.error : C.primary } }} />
      </Box>
    );
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ ...glassCardStatic, p: 3, border: `1px solid ${alpha(C.error, 0.25)}`, background: alpha(C.error, 0.02) }}>
            <Typography sx={{ ...sectionTitle, color: C.error }}><WarningIcon sx={{ color: C.error }} /> SOS Controls</Typography>
            <Typography sx={{ fontSize: '.82rem', color: C.textDim, mb: 2 }}>Emergency controls. Use with caution.</Typography>
            <SosToggle label="Pause New Interviews" settingKey="pause_new_interviews" danger icon={<PauseCircleIcon sx={{ color: C.warning }} />} />
            <SosToggle label="Pause New Signups" settingKey="pause_new_signups" danger icon={<BlockIcon sx={{ color: C.error }} />} />
            <SosToggle label="Maintenance Mode" settingKey="maintenance_mode" danger icon={<BuildIcon sx={{ color: C.error }} />} />
            <Divider sx={{ my: 2, borderColor: alpha(C.error, 0.2) }} />
            <Button fullWidth variant="outlined" startIcon={<SendIcon />}
              onClick={() => setAlertDialog({ open: true, subject: 'System Alert — IntelliHire', message: '' })}
              sx={{ borderColor: alpha(C.error, 0.4), color: C.error, fontWeight: 700, textTransform: 'none', py: 1.5, borderRadius: '10px',
                '&:hover': { borderColor: C.error, background: alpha(C.error, 0.08) } }}>
              Send System Alert Email
            </Button>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ ...glassCardStatic, p: 3 }}>
            <Typography sx={sectionTitle}><SettingsIcon sx={{ color: C.primary }} /> System Info</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {Object.entries(settings).filter(([k]) => !['pause_new_interviews','pause_new_signups','maintenance_mode','system_alert_message'].includes(k))
                .map(([k, v]) => (
                  <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, borderRadius: '8px', background: alpha(C.primary, 0.04) }}>
                    <Typography sx={{ fontSize: '.85rem', color: C.textMuted, fontFamily: 'monospace' }}>{k}</Typography>
                    <Typography sx={{ fontSize: '.85rem', color: C.text, fontWeight: 600 }}>{v}</Typography>
                  </Box>
                ))}
              {Object.keys(settings).length <= 4 && <Typography sx={{ color: C.textDim, fontSize: '.85rem', textAlign: 'center', py: 2 }}>Only core SOS settings configured.</Typography>}
            </Box>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const tabPanels = [renderDashboard, renderLeads, renderClients, renderRevenue, renderHealth, renderApiStatus, renderAuditLogs, renderAnnouncements, renderSettings];

  const dialogSx = { background: '#1e293b', color: C.text, borderRadius: '16px', border: `1px solid ${C.border}` };
  const inputSx = { '& .MuiInputBase-root': { color: C.text }, '& .MuiInputLabel-root': { color: C.textMuted } };

  return (
    <Box sx={{ minHeight: '100vh', background: `linear-gradient(180deg, ${C.bg} 0%, #0f172a 50%, ${C.bg} 100%)`, display: 'flex' }}>
      {/* Sidebar */}
      <Box sx={{ width: 240, minHeight: '100vh', background: alpha('#000', 0.3), backdropFilter: 'blur(20px)',
        borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', py: 3, px: 1.5,
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
        <Box sx={{ px: 1.5, mb: 4 }}>
          <Typography sx={{ fontWeight: 900, fontSize: '1.4rem', background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>IntelliHire</Typography>
          <Typography sx={{ fontSize: '.72rem', color: C.textDim, fontWeight: 600 }}>Admin Panel</Typography>
        </Box>
        {TABS.map((t, i) => (
          <Box key={i} onClick={() => setTab(i)} sx={{
            display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1.2, mb: .5, cursor: 'pointer', borderRadius: '10px',
            color: tab === i ? C.primary : C.textMuted, background: tab === i ? alpha(C.primary, 0.1) : 'transparent',
            fontWeight: tab === i ? 700 : 500, fontSize: '.88rem', transition: 'all 0.2s ease',
            '&:hover': { background: alpha(C.primary, 0.06), color: C.primaryLight },
          }}>
            {React.cloneElement(t.icon, { sx: { fontSize: 20 } })} {t.label}
          </Box>
        ))}
        <Box sx={{ mt: 'auto', pt: 3, px: 1 }}>
          <Divider sx={{ borderColor: C.border, mb: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '8px', background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '.85rem' }}>
              {user?.username?.[0]?.toUpperCase() || 'A'}
            </Box>
            <Box><Typography sx={{ fontSize: '.82rem', color: C.text, fontWeight: 600 }}>{user?.username}</Typography>
              <Typography sx={{ fontSize: '.68rem', color: C.textDim }}>Administrator</Typography></Box>
          </Box>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, p: 4, overflowY: 'auto', minHeight: '100vh' }}>
        <Box sx={{ mb: 4 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.8rem', color: C.text }}>{TABS[tab].label}</Typography>
          <Typography sx={{ fontSize: '.88rem', color: C.textDim }}>Welcome back, {user?.full_name || user?.username}</Typography>
        </Box>
        {tabPanels[tab]?.()}
      </Box>

      {/* ─── DIALOGS ─────────────────────────────────────── */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, lead: null, quota: 50, subscription_months: 12 })} maxWidth="sm" fullWidth PaperProps={{ sx: dialogSx }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Lead & Generate Credentials</DialogTitle>
        <DialogContent>{confirmDialog.lead && (
          <Box sx={{ mt: 1 }}>
            <Typography sx={{ mb: 2, color: C.textMuted }}>Create login for <strong style={{ color: C.text }}>{confirmDialog.lead.full_name}</strong> at <strong style={{ color: C.text }}>{confirmDialog.lead.company_name}</strong>.</Typography>
            <TextField fullWidth label="Plan/Tier" value={confirmDialog.lead?.selected_plan || ''} disabled sx={{ mb: 2, ...inputSx }} />
            <TextField fullWidth label="Interview Quota" type="number" value={confirmDialog.quota || 50}
              onChange={(e) => setConfirmDialog({ ...confirmDialog, quota: parseInt(e.target.value) })} sx={{ mb: 2, ...inputSx }} />
            <TextField fullWidth select label="Subscription Duration" value={confirmDialog.subscription_months || 12}
              onChange={(e) => setConfirmDialog({ ...confirmDialog, subscription_months: parseInt(e.target.value) })} sx={inputSx}
              SelectProps={{ MenuProps: { PaperProps: { sx: { bgcolor: '#1a2332', color: C.text } } } }}>
              <MenuItem value={1}>1 Month</MenuItem>
              <MenuItem value={3}>3 Months</MenuItem>
              <MenuItem value={6}>6 Months</MenuItem>
              <MenuItem value={12}>12 Months</MenuItem>
              <MenuItem value={24}>24 Months</MenuItem>
            </TextField>
          </Box>
        )}</DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setConfirmDialog({ open: false, lead: null, quota: 50, subscription_months: 12 })} sx={{ color: C.textMuted }}>Cancel</Button>
          <Button onClick={handleConfirmLead} disabled={loading} sx={primaryBtn}>{loading ? 'Processing...' : 'Confirm & Send Credentials'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={leadDetailDialog.open} onClose={() => setLeadDetailDialog({ open: false, lead: null })} maxWidth="sm" fullWidth PaperProps={{ sx: dialogSx }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Lead Details</DialogTitle>
        <DialogContent>{leadDetailDialog.lead && (() => {
          const l = leadDetailDialog.lead;
          const fields = [['Full Name', l.full_name],['Job Title', l.job_title],['Company', l.company_name],['Size', l.company_size],['Industry', l.industry],['Email', l.work_email],['Phone', l.phone],['Country', l.country],['Plan', l.selected_plan],['Status', l.status],['Message', l.message]];
          return <Box sx={{ mt: 1 }}>{fields.map(([k, v]) => v && <Box key={k} sx={{ display: 'flex', py: 1, borderBottom: `1px solid ${C.border}` }}><Typography sx={{ width: 120, fontSize: '.85rem', color: C.textDim, flexShrink: 0 }}>{k}</Typography><Typography sx={{ fontSize: '.85rem', color: C.text }}>{v}</Typography></Box>)}</Box>;
        })()}</DialogContent>
        <DialogActions sx={{ p: 3 }}><Button onClick={() => setLeadDetailDialog({ open: false, lead: null })} sx={{ color: C.textMuted }}>Close</Button></DialogActions>
      </Dialog>

      <Dialog open={quotaDialog.open} onClose={() => setQuotaDialog({ open: false, client: null, addQuota: 10 })} maxWidth="xs" fullWidth PaperProps={{ sx: dialogSx }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Interview Quota</DialogTitle>
        <DialogContent>{quotaDialog.client && (
          <Box sx={{ mt: 1 }}>
            <Typography sx={{ mb: 2, color: C.textMuted }}>{quotaDialog.client.company_name} — Quota: {quotaDialog.client.interview_quota}, Used: {quotaDialog.client.interviews_used}</Typography>
            <TextField fullWidth label="Add Interviews" type="number" value={quotaDialog.addQuota}
              onChange={(e) => setQuotaDialog({ ...quotaDialog, addQuota: e.target.value })} sx={inputSx} />
          </Box>
        )}</DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setQuotaDialog({ open: false, client: null, addQuota: 10 })} sx={{ color: C.textMuted }}>Cancel</Button>
          <Button onClick={handleUpdateQuota} sx={primaryBtn}>Add Quota</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={paymentDialog.open} onClose={() => setPaymentDialog({ ...paymentDialog, open: false })} maxWidth="sm" fullWidth PaperProps={{ sx: dialogSx }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Record Payment</DialogTitle>
        <DialogContent><Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth><InputLabel sx={{ color: C.textMuted }}>Client</InputLabel>
            <Select value={paymentDialog.clientId} onChange={(e) => setPaymentDialog({ ...paymentDialog, clientId: e.target.value })} sx={{ color: C.text }}>
              {clients.map(c => <MenuItem key={c.id} value={c.id}>{c.company_name}</MenuItem>)}</Select></FormControl>
          <TextField fullWidth label="Amount ($)" type="number" value={paymentDialog.amount} onChange={(e) => setPaymentDialog({ ...paymentDialog, amount: e.target.value })} sx={inputSx} />
          <TextField fullWidth label="Payment Reference" value={paymentDialog.ref} onChange={(e) => setPaymentDialog({ ...paymentDialog, ref: e.target.value })} sx={inputSx} />
          <TextField fullWidth label="Description" value={paymentDialog.desc} onChange={(e) => setPaymentDialog({ ...paymentDialog, desc: e.target.value })} sx={inputSx} />
        </Box></DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setPaymentDialog({ ...paymentDialog, open: false })} sx={{ color: C.textMuted }}>Cancel</Button>
          <Button onClick={handleRecordPayment} sx={primaryBtn}>Record</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={refundDialog.open} onClose={() => setRefundDialog({ ...refundDialog, open: false })} maxWidth="sm" fullWidth PaperProps={{ sx: dialogSx }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Process Refund</DialogTitle>
        <DialogContent><Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField fullWidth label="Refund Amount ($)" type="number" value={refundDialog.amount} onChange={(e) => setRefundDialog({ ...refundDialog, amount: e.target.value })} sx={inputSx} />
          <TextField fullWidth multiline rows={3} label="Reason" value={refundDialog.reason} onChange={(e) => setRefundDialog({ ...refundDialog, reason: e.target.value })} sx={inputSx} />
        </Box></DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setRefundDialog({ ...refundDialog, open: false })} sx={{ color: C.textMuted }}>Cancel</Button>
          <Button onClick={handleProcessRefund} sx={{ ...primaryBtn, background: `linear-gradient(135deg, ${C.error}, #f97316)` }}>Process Refund</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={announcementDialog.open} onClose={() => setAnnouncementDialog({ ...announcementDialog, open: false })} maxWidth="sm" fullWidth PaperProps={{ sx: dialogSx }}>
        <DialogTitle sx={{ fontWeight: 700 }}>New Announcement</DialogTitle>
        <DialogContent><Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField fullWidth label="Title" value={announcementDialog.title} onChange={(e) => setAnnouncementDialog({ ...announcementDialog, title: e.target.value })} sx={inputSx} />
          <TextField fullWidth multiline rows={4} label="Content" value={announcementDialog.content} onChange={(e) => setAnnouncementDialog({ ...announcementDialog, content: e.target.value })} sx={inputSx} />
          <FormControl fullWidth><InputLabel sx={{ color: C.textMuted }}>Type</InputLabel>
            <Select value={announcementDialog.type} onChange={(e) => setAnnouncementDialog({ ...announcementDialog, type: e.target.value })} sx={{ color: C.text }}>
              <MenuItem value="info">Info</MenuItem><MenuItem value="warning">Warning</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem><MenuItem value="update">Update</MenuItem>
            </Select></FormControl>
        </Box></DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setAnnouncementDialog({ ...announcementDialog, open: false })} sx={{ color: C.textMuted }}>Cancel</Button>
          <Button onClick={handleCreateAnnouncement} sx={primaryBtn}>Publish</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={alertDialog.open} onClose={() => setAlertDialog({ ...alertDialog, open: false })} maxWidth="sm" fullWidth PaperProps={{ sx: { ...dialogSx, border: `1px solid ${alpha(C.error, 0.3)}` } }}>
        <DialogTitle sx={{ fontWeight: 700, color: C.error }}><WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />Send Alert to All Clients</DialogTitle>
        <DialogContent><Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField fullWidth label="Subject" value={alertDialog.subject} onChange={(e) => setAlertDialog({ ...alertDialog, subject: e.target.value })} sx={inputSx} />
          <TextField fullWidth multiline rows={5} label="Message" value={alertDialog.message} onChange={(e) => setAlertDialog({ ...alertDialog, message: e.target.value })} sx={inputSx} />
        </Box></DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setAlertDialog({ ...alertDialog, open: false })} sx={{ color: C.textMuted }}>Cancel</Button>
          <Button onClick={handleSendAlertEmail} sx={{ ...primaryBtn, background: `linear-gradient(135deg, ${C.error}, #f97316)` }}>Send to All</Button>
        </DialogActions>
      </Dialog>

      {/* Create Client Manually */}
      <Dialog open={createClientDialog.open} onClose={() => setCreateClientDialog(p => ({ ...p, open: false }))} maxWidth="sm" fullWidth PaperProps={{ sx: dialogSx }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Client Manually</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField fullWidth label="Company Name" value={createClientDialog.company_name}
              onChange={(e) => setCreateClientDialog({ ...createClientDialog, company_name: e.target.value })} sx={inputSx} />
            <TextField fullWidth label="Contact Name" value={createClientDialog.contact_name}
              onChange={(e) => setCreateClientDialog({ ...createClientDialog, contact_name: e.target.value })} sx={inputSx} />
            <TextField fullWidth label="Email" type="email" value={createClientDialog.email}
              onChange={(e) => setCreateClientDialog({ ...createClientDialog, email: e.target.value })} sx={inputSx} />
            <TextField fullWidth label="Temporary Password (optional)" type="password" value={createClientDialog.password}
              onChange={(e) => setCreateClientDialog({ ...createClientDialog, password: e.target.value })} sx={inputSx}
              helperText="Leave empty for auto-generated" FormHelperTextProps={{ sx: { color: C.textDim } }} />
            <TextField fullWidth select label="Plan" value={createClientDialog.plan}
              onChange={(e) => setCreateClientDialog({ ...createClientDialog, plan: e.target.value })} sx={inputSx}
              SelectProps={{ MenuProps: { PaperProps: { sx: { bgcolor: '#1a2332', color: C.text } } } }}>
              <MenuItem value="starter">Starter</MenuItem>
              <MenuItem value="professional">Professional</MenuItem>
              <MenuItem value="enterprise">Enterprise</MenuItem>
            </TextField>
            <TextField fullWidth label="Interview Quota" type="number" value={createClientDialog.quota}
              onChange={(e) => setCreateClientDialog({ ...createClientDialog, quota: parseInt(e.target.value) || 0 })} sx={inputSx} />
            <TextField fullWidth select label="Subscription Duration" value={createClientDialog.subscription_months}
              onChange={(e) => setCreateClientDialog({ ...createClientDialog, subscription_months: parseInt(e.target.value) })} sx={inputSx}
              SelectProps={{ MenuProps: { PaperProps: { sx: { bgcolor: '#1a2332', color: C.text } } } }}>
              <MenuItem value={1}>1 Month</MenuItem>
              <MenuItem value={3}>3 Months</MenuItem>
              <MenuItem value={6}>6 Months</MenuItem>
              <MenuItem value={12}>12 Months</MenuItem>
              <MenuItem value={24}>24 Months</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setCreateClientDialog(p => ({ ...p, open: false }))} sx={{ color: C.textMuted }}>Cancel</Button>
          <Button onClick={handleCreateClient} disabled={loading || !createClientDialog.company_name || !createClientDialog.email}
            sx={primaryBtn}>{loading ? 'Creating...' : 'Create Client'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity} sx={{ borderRadius: '12px', fontWeight: 600 }}>{toast.msg}</Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboard;
