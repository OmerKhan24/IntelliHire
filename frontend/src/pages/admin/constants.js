import { alpha } from '@mui/material/styles';

// ─── Theme tokens ────────────────────────────────────────
export const C = {
  primary: '#2f97f7', primaryDark: '#1a7ad4', primaryLight: '#5db8ff',
  accent: '#0ea5e9', bg: '#0b1120',
  bgCard: 'rgba(255,255,255,0.04)', bgCardHover: 'rgba(255,255,255,0.07)',
  border: 'rgba(255,255,255,0.08)', borderActive: 'rgba(47,151,247,0.4)',
  text: '#e2e8f0', textMuted: '#94a3b8', textDim: '#64748b',
  success: '#10b981', warning: '#f59e0b', error: '#ef4444',
};

// ─── Shared MUI sx objects ────────────────────────────────
export const glassCard = {
  background: C.bgCard, backdropFilter: 'blur(24px)',
  border: `1px solid ${C.border}`, borderRadius: '16px',
  transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
  '&:hover': {
    background: C.bgCardHover, borderColor: C.borderActive,
    transform: 'translateY(-2px)', boxShadow: `0 12px 40px ${alpha(C.primary, 0.12)}`,
  },
};

export const glassCardStatic = {
  background: C.bgCard, backdropFilter: 'blur(24px)',
  border: `1px solid ${C.border}`, borderRadius: '16px',
};

export const sectionTitle = {
  fontWeight: 700, fontSize: '1.1rem', color: C.text,
  mb: 2, display: 'flex', alignItems: 'center', gap: 1,
};

export const tableHeaderCell = {
  color: C.textMuted, fontWeight: 700, fontSize: '.78rem',
  textTransform: 'uppercase', letterSpacing: '.06em',
  borderBottom: `1px solid ${C.border}`, py: 1.5,
};

export const tableBodyCell = {
  color: C.text, borderBottom: `1px solid ${alpha(C.border, 0.5)}`, py: 1.5,
};

export const statusChip = (color) => ({
  background: alpha(color, 0.15), color, fontWeight: 700, fontSize: '.75rem',
  border: `1px solid ${alpha(color, 0.3)}`,
});

export const primaryBtn = {
  background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`,
  color: '#fff', fontWeight: 700, borderRadius: '10px',
  textTransform: 'none', px: 3, py: 1,
  boxShadow: `0 4px 20px ${alpha(C.primary, 0.3)}`,
  '&:hover': {
    background: `linear-gradient(135deg, ${C.accent}, ${C.primary})`,
    boxShadow: `0 8px 30px ${alpha(C.primary, 0.4)}`, transform: 'translateY(-1px)',
  },
};

export const dialogSx = {
  background: '#1e293b', color: C.text, borderRadius: '16px', border: `1px solid ${C.border}`,
};

export const inputSx = {
  '& .MuiInputBase-root': { color: C.text },
  '& .MuiInputLabel-root': { color: C.textMuted },
};

// ─── Utilities ────────────────────────────────────────────
export const fmtBytes = (b) => {
  if (!b) return '0 B';
  const k = 1024, sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return (b / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
};

export const fmtUptime = (s) => {
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
};

export const statusColor = (s) => {
  const map = {
    new: C.primary, contacted: C.warning, confirmed: C.success,
    converted: '#8b5cf6', lost: C.error,
    completed: C.success, pending: C.warning, failed: C.error,
    refunded: '#f97316', processed: C.success,
    starter: '#3b82f6', professional: '#8b5cf6', enterprise: C.warning,
  };
  return map[s] || C.textMuted;
};
