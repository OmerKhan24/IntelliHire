import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Divider, Snackbar, Alert } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

// ─── Sidebar icons ────────────────────────────────────────
import DashboardIcon from '@mui/icons-material/Dashboard';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DnsIcon from '@mui/icons-material/Dns';
import ApiIcon from '@mui/icons-material/Api';
import HistoryIcon from '@mui/icons-material/History';
import CampaignIcon from '@mui/icons-material/Campaign';
import SettingsIcon from '@mui/icons-material/Settings';

// ─── Shared constants ─────────────────────────────────────
import { C, primaryBtn } from './admin/constants';

// ─── Tab sections ─────────────────────────────────────────
import DashboardTab      from './admin/tabs/DashboardTab';
import LeadsTab          from './admin/tabs/LeadsTab';
import ClientsTab        from './admin/tabs/ClientsTab';
import RevenueTab        from './admin/tabs/RevenueTab';
import ServerHealthTab   from './admin/tabs/ServerHealthTab';
import ApiStatusTab      from './admin/tabs/ApiStatusTab';
import AuditLogsTab      from './admin/tabs/AuditLogsTab';
import AnnouncementsTab  from './admin/tabs/AnnouncementsTab';
import SettingsTab       from './admin/tabs/SettingsTab';

// ─── Dialogs ──────────────────────────────────────────────
import ConfirmLeadDialog     from './admin/dialogs/ConfirmLeadDialog';
import LeadDetailDialog      from './admin/dialogs/LeadDetailDialog';
import AddQuotaDialog        from './admin/dialogs/AddQuotaDialog';
import RecordPaymentDialog   from './admin/dialogs/RecordPaymentDialog';
import ProcessRefundDialog   from './admin/dialogs/ProcessRefundDialog';
import NewAnnouncementDialog from './admin/dialogs/NewAnnouncementDialog';
import AlertEmailDialog      from './admin/dialogs/AlertEmailDialog';
import CreateClientDialog    from './admin/dialogs/CreateClientDialog';

// ─── Sidebar tab definitions ──────────────────────────────
const TABS = [
  { label: 'Dashboard',     icon: <DashboardIcon /> },
  { label: 'Leads',         icon: <LeaderboardIcon /> },
  { label: 'Clients',       icon: <PeopleIcon /> },
  { label: 'Revenue',       icon: <AttachMoneyIcon /> },
  { label: 'Server Health', icon: <DnsIcon /> },
  { label: 'API Status',    icon: <ApiIcon /> },
  { label: 'Audit Logs',    icon: <HistoryIcon /> },
  { label: 'Announcements', icon: <CampaignIcon /> },
  { label: 'Settings',      icon: <SettingsIcon /> },
];


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
            <Box>
              <Typography sx={{ fontSize: '.82rem', color: C.text, fontWeight: 600 }}>{user?.username}</Typography>
              <Typography sx={{ fontSize: '.68rem', color: C.textDim }}>Administrator</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, p: 4, overflowY: 'auto', minHeight: '100vh' }}>
        <Box sx={{ mb: 4 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.8rem', color: C.text }}>{TABS[tab].label}</Typography>
          <Typography sx={{ fontSize: '.88rem', color: C.textDim }}>Welcome back, {user?.full_name || user?.username}</Typography>
        </Box>
        {tab === 0 && <DashboardTab dashboard={dashboard} setLeadDetailDialog={setLeadDetailDialog} />}
        {tab === 1 && <LeadsTab leads={leads} loadLeads={loadLeads} setLeadDetailDialog={setLeadDetailDialog} setConfirmDialog={setConfirmDialog} handleUpdateLeadStatus={handleUpdateLeadStatus} />}
        {tab === 2 && <ClientsTab clients={clients} loadClients={loadClients} setCreateClientDialog={setCreateClientDialog} setQuotaDialog={setQuotaDialog} />}
        {tab === 3 && <RevenueTab payments={payments} refunds={refunds} totalRevenue={totalRevenue} loadRevenue={loadRevenue} setPaymentDialog={setPaymentDialog} setRefundDialog={setRefundDialog} clients={clients} />}
        {tab === 4 && <ServerHealthTab health={health} loadHealth={loadHealth} />}
        {tab === 5 && <ApiStatusTab apiStatusData={apiStatusData} loadApiStatus={loadApiStatus} />}
        {tab === 6 && <AuditLogsTab auditLogs={auditLogs} auditTotal={auditTotal} auditPage={auditPage} loadAuditLogs={loadAuditLogs} />}
        {tab === 7 && <AnnouncementsTab announcements={announcements} setAnnouncementDialog={setAnnouncementDialog} handleDeleteAnnouncement={handleDeleteAnnouncement} />}
        {tab === 8 && <SettingsTab settings={settings} handleSosToggle={handleSosToggle} setAlertDialog={setAlertDialog} />}
      </Box>

      {/* Dialogs */}
      <ConfirmLeadDialog confirmDialog={confirmDialog} setConfirmDialog={setConfirmDialog} handleConfirmLead={handleConfirmLead} loading={loading} />
      <LeadDetailDialog leadDetailDialog={leadDetailDialog} setLeadDetailDialog={setLeadDetailDialog} />
      <AddQuotaDialog quotaDialog={quotaDialog} setQuotaDialog={setQuotaDialog} handleUpdateQuota={handleUpdateQuota} />
      <RecordPaymentDialog paymentDialog={paymentDialog} setPaymentDialog={setPaymentDialog} handleRecordPayment={handleRecordPayment} clients={clients} />
      <ProcessRefundDialog refundDialog={refundDialog} setRefundDialog={setRefundDialog} handleProcessRefund={handleProcessRefund} />
      <NewAnnouncementDialog announcementDialog={announcementDialog} setAnnouncementDialog={setAnnouncementDialog} handleCreateAnnouncement={handleCreateAnnouncement} />
      <AlertEmailDialog alertDialog={alertDialog} setAlertDialog={setAlertDialog} handleSendAlertEmail={handleSendAlertEmail} />
      <CreateClientDialog createClientDialog={createClientDialog} setCreateClientDialog={setCreateClientDialog} handleCreateClient={handleCreateClient} loading={loading} />

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity} sx={{ borderRadius: '12px', fontWeight: 600 }}>{toast.msg}</Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboard;