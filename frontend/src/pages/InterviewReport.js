import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Typography, Box, Card, CardContent, Grid, Paper, Chip, CircularProgress,
  Alert, Button, Tabs, Tab, LinearProgress, Avatar, Divider, Collapse,
  Checkbox, Skeleton
} from '@mui/material';
import {
  Person as PersonIcon, Star as StarIcon, Warning as WarningIcon,
  CheckCircle as CheckIcon, Assessment as AssessmentIcon, Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon,
  CompareArrows as CompareIcon,
  Shield as ShieldIcon, Psychology as PsychologyIcon, Description as DescriptionIcon,
  RecordVoiceOver as VoiceIcon, Videocam as VideocamIcon,
  FlagCircle as FlagIcon, AutoAwesome as AutoAwesomeIcon,
  Refresh as RefreshIcon, PhotoCamera as PhotoCameraIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip as RechartTooltip
} from 'recharts';

/* ─── Design Tokens (matching landing-page) ─── */
const C = {
  primary: '#2f97f7', accent: '#0ea5e9', bg: '#0b1120',
  text: '#e2e8f0', textMuted: '#94a3b8', textDim: '#64748b',
  success: '#10b981', warning: '#f59e0b', error: '#ef4444',
  border: 'rgba(255,255,255,0.08)',
};
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/* ─── Shared Styles ─── */
const glassCard = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
  backdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 4,
  boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
};
const sectionTitle = {
  color: '#fff', fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1
};
const mutedText = { color: 'rgba(255,255,255,0.55)' };
const tealGrad = 'linear-gradient(135deg, #2f97f7 0%, #0ea5e9 100%)';
const emeraldGrad = 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)';

/* ─── Helpers ─── */
const fmt = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '—';

const scColor = (s, max = 10) => {
  const pct = (s / max) * 100;
  return pct >= 75 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444';
};

const pctColor = (s) => (s >= 80 ? '#10B981' : s >= 60 ? '#F59E0B' : '#EF4444');

/* ─── Radar Section ─── */
const RadarSection = ({ title, icon, data, color = 'C.primary', max = 5 }) => (
  <Card sx={{ ...glassCard, p: 3 }}>
    <Typography variant="h6" sx={sectionTitle}>
      {icon} {title}
    </Typography>
    <Box sx={{ width: '100%', height: 320 }}>
      <ResponsiveContainer>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="rgba(255,255,255,0.15)" />
          <PolarAngleAxis
            dataKey="label"
            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
          />
          <PolarRadiusAxis
            domain={[0, max]}
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
            axisLine={false}
          />
          <Radar
            dataKey="value"
            stroke={color}
            fill={color}
            fillOpacity={0.25}
            strokeWidth={2}
            dot={{ r: 4, fill: color }}
          />
          <RechartTooltip
            contentStyle={{
              background: 'rgba(10,25,47,0.9)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 8,
              color: '#fff',
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </Box>
  </Card>
);

/* ─── Score Badge (ring) ─── */
const ScoreBadge = ({ score, max = 10 }) => (
  <Box
    sx={{
      width: 100, height: 100, borderRadius: '50%', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: `conic-gradient(${scColor(score, max)} ${(score / max) * 360}deg, rgba(255,255,255,0.1) 0deg)`,
      color: '#fff', fontWeight: 800, fontSize: '2rem',
    }}
  >
    <Box
      sx={{
        width: '80%', height: '80%', borderRadius: '50%',
        background: 'rgba(10,25,47,0.85)', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
      }}
    >
      {score.toFixed(1)}
    </Box>
  </Box>
);

/* ─── Expandable Row ─── */
const ExpandableRow = ({ title, detail, flagged = false, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Paper sx={{ ...glassCard, mb: 1.5, overflow: 'hidden' }}>
      <Box
        sx={{
          p: 2, display: 'flex', alignItems: 'center', cursor: 'pointer',
          '&:hover': { background: 'rgba(255,255,255,0.05)' },
        }}
        onClick={() => setOpen(!open)}
      >
        <Box
          sx={{
            width: 10, height: 10, borderRadius: '50%', mr: 2,
            background: flagged ? '#EF4444' : '#10B981',
            boxShadow: flagged ? '0 0 8px #EF4444' : '0 0 8px #10B981',
          }}
        />
        <Typography sx={{ color: '#fff', fontWeight: 600, flex: 1 }}>{title}</Typography>
        {open ? (
          <ExpandLessIcon sx={{ color: 'rgba(255,255,255,0.5)' }} />
        ) : (
          <ExpandMoreIcon sx={{ color: 'rgba(255,255,255,0.5)' }} />
        )}
      </Box>
      <Collapse in={open}>
        <Box sx={{ px: 3, pb: 2 }}>
          <Typography sx={{ ...mutedText, lineHeight: 1.7 }}>{detail}</Typography>
        </Box>
      </Collapse>
    </Paper>
  );
};

/* ─── Loading Skeleton ─── */
const ReportSkeleton = () => (
  <Box sx={{ p: 4 }}>
    {[...Array(6)].map((_, i) => (
      <Skeleton
        key={i}
        variant="rounded"
        height={120}
        sx={{ mb: 3, bgcolor: 'rgba(255,255,255,0.06)', borderRadius: 3 }}
      />
    ))}
  </Box>
);

/* ═══════════════════════════ MAIN ═══════════════════════════ */
const InterviewReport = () => {
  const { jobId } = useParams();

  const [job, setJob] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [reportStatus, setReportStatus] = useState('idle');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [compareMode, setCompareMode] = useState(false);
  const [compareSelected, setCompareSelected] = useState([]);
  const [compareData, setCompareData] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);

  /* ── Load job + interviews ── */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [jobRes, reportRes] = await Promise.all([
          api.jobs.get(jobId),
          api.reports.getJob(jobId),
        ]);
        setJob(jobRes.data.job);
        const ints = reportRes.data.interviews || [];
        setInterviews(ints);
        const completed = ints.filter((i) => i.status === 'completed');
        if (completed.length > 0) setSelectedInterview(completed[0]);
      } catch (err) {
        setError('Failed to load: ' + (err.response?.data?.error || err.message));
      } finally {
        setLoading(false);
      }
    })();
  }, [jobId]);

  /* ── Load rich report when candidate changes ── */
  const loadReport = useCallback(async (id) => {
    if (!id) return;
    setReportStatus('loading');
    setReportData(null);
    try {
      const res = await api.reports.getCandidateReport(id);
      if (res.data.success) {
        setReportData(res.data.report.report_data);
        setReportStatus('loaded');
      } else {
        setReportStatus('idle');
      }
    } catch (err) {
      setReportStatus(err.response?.status === 404 ? 'idle' : 'error');
    }
  }, []);

  useEffect(() => {
    if (selectedInterview?.id && selectedInterview.status === 'completed') {
      loadReport(selectedInterview.id);
    }
  }, [selectedInterview, loadReport]);

  /* ── Generate report ── */
  const handleGenerate = async (force = false) => {
    if (!selectedInterview) return;
    setReportStatus('loading');
    try {
      const res = await api.reports.generateCandidateReport(selectedInterview.id, force);
      if (res.data.success) {
        setReportData(res.data.report.report_data);
        setReportStatus('loaded');
      }
    } catch (err) {
      setError('Report generation failed: ' + (err.response?.data?.error || err.message));
      setReportStatus('error');
    }
  };

  /* ── Compare ── */
  const handleCompare = async () => {
    if (compareSelected.length < 2) return;
    setCompareLoading(true);
    try {
      const res = await api.reports.compareCandidates(compareSelected);
      if (res.data.success) setCompareData(res.data.candidates);
    } catch (err) {
      setError('Compare failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setCompareLoading(false);
    }
  };

  const toggleCompare = (id) =>
    setCompareSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  /* ── Stats ── */
  const stats = (() => {
    const c = interviews.filter((i) => i.status === 'completed');
    if (!c.length) return null;
    const sc = c.map((i) => i.final_score || 0);
    return {
      avg: (sc.reduce((a, b) => a + b, 0) / sc.length).toFixed(1),
      max: Math.max(...sc).toFixed(1),
      done: c.length,
      total: interviews.length,
    };
  })();

  const downloadReport = async () => {
    try {
      const r = await api.reports.downloadReport(jobId);
      const blob = new Blob([JSON.stringify(r.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${job?.title || 'job'}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Download failed');
    }
  };

  /* ── Loading state ── */
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: C.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ color: C.primary, mb: 2 }} />
          <Typography sx={{ color: '#fff' }}>Loading report...</Typography>
        </Box>
      </Box>
    );
  }

  /* ── Derived data ── */
  const rd = reportData || {};
  const toRadar = (obj) =>
    obj
      ? Object.entries(obj)
          .filter(([k]) => k !== 'error')
          .map(([k, v]) => ({
            label: k
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (c) => c.toUpperCase()),
            value: v,
          }))
      : [];

  const commData = toRadar(rd.communication_skills);
  const cogData = toRadar(rd.cognitive_insights);
  const cvRadar = toRadar(rd.cv_profile_radar);
  const fit = rd.overall_fit || {};
  const rubrics = rd.rubrics || [];
  const integrity = rd.integrity_signals || {};
  const vibe = rd.vibe_panel || {};
  const flags = rd.red_flags || {};
  const attrs = rd.key_attributes || {};
  const docProf = rd.document_professionalism || {};
  const qaPairs = rd.qa_pairs || [];

  /* ── CV monitoring screenshots ── */
  const cvMonitoring = selectedInterview?.cv_monitoring_report || {};
  const criticalEvents = (cvMonitoring.critical_events || []).filter(e => e.screenshot);

  /* ═══════════════ RENDER ═══════════════ */
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: C.bg,
        position: 'relative',
        '&::before': {
          content: '""', position: 'absolute', inset: 0,
          background:
            'radial-gradient(circle at 20% 40%, rgba(47,151,247,0.06) 0%, transparent 50%), radial-gradient(circle at 75% 80%, rgba(14,165,233,0.05) 0%, transparent 50%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="xl" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        {/* ─── HEADER ─── */}
        <Card sx={{ ...glassCard, mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Box
              sx={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'flex-start', flexWrap: 'wrap', gap: 2,
              }}
            >
              <Box>
                <Typography
                  variant="h3"
                  sx={{
                    color: '#fff', fontWeight: 800,
                    background: tealGrad, WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent', mb: 1,
                  }}
                >
                  Candidate Report
                </Typography>
                {job && (
                  <>
                    <Typography variant="h5" sx={{ color: '#fff', fontWeight: 600, mb: 0.5 }}>
                      {job.title}
                    </Typography>
                    <Typography sx={mutedText}>Created {fmt(job.created_at)}</Typography>
                  </>
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  startIcon={<CompareIcon />}
                  onClick={() => {
                    setCompareMode(!compareMode);
                    setCompareData(null);
                    setCompareSelected([]);
                  }}
                  sx={{
                    background: compareMode ? emeraldGrad : 'rgba(255,255,255,0.08)',
                    color: '#fff', textTransform: 'none', fontWeight: 600, px: 2.5,
                  }}
                >
                  {compareMode ? 'Exit Compare' : 'Compare'}
                </Button>
                <Button
                  startIcon={<DownloadIcon />}
                  onClick={downloadReport}
                  sx={{
                    background: 'rgba(255,255,255,0.08)', color: '#fff',
                    textTransform: 'none', fontWeight: 600, px: 2.5,
                  }}
                >
                  Export
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* ─── STATS ─── */}
        {stats && (
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {[
              { v: stats.done, l: 'Completed', g: tealGrad, i: <PersonIcon /> },
              { v: stats.avg, l: 'Avg Score', g: emeraldGrad, i: <StarIcon /> },
              { v: stats.max, l: 'Top Score', g: 'linear-gradient(135deg,#D97706,#F59E0B)', i: <CheckIcon /> },
              { v: `${((stats.done / stats.total) * 100).toFixed(0)}%`, l: 'Completion', g: 'linear-gradient(135deg,#1E40AF,#3B82F6)', i: <AssessmentIcon /> },
            ].map((s, idx) => (
              <Grid item xs={6} md={3} key={idx}>
                <Card
                  sx={{
                    background: s.g, color: '#fff', borderRadius: 3,
                    overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  }}
                >
                  <CardContent
                    sx={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', py: 2.5,
                    }}
                  >
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                        {s.v}
                      </Typography>
                      <Typography sx={{ opacity: 0.9, fontWeight: 600, fontSize: '0.85rem' }}>
                        {s.l}
                      </Typography>
                    </Box>
                    {React.cloneElement(s.i, { sx: { fontSize: 44, opacity: 0.6 } })}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* ─── COMPARE BAR ─── */}
        {compareMode && (
          <Card
            sx={{
              ...glassCard, mb: 3, p: 2,
              display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap',
            }}
          >
            <Typography sx={{ color: '#fff', fontWeight: 600 }}>
              Select candidates to compare:
            </Typography>
            <Chip
              label={`${compareSelected.length} selected`}
              sx={{
                color: '#fff', background: 'rgba(47,151,247,0.3)',
                border: '1px solid rgba(47,151,247,0.5)',
              }}
            />
            <Button
              variant="contained"
              disabled={compareSelected.length < 2 || compareLoading}
              onClick={handleCompare}
              sx={{
                background: tealGrad, textTransform: 'none',
                fontWeight: 600, ml: 'auto',
              }}
            >
              {compareLoading ? (
                <CircularProgress size={20} sx={{ color: '#fff' }} />
              ) : (
                'Compare Now'
              )}
            </Button>
          </Card>
        )}

        {/* ─── COMPARE TABLE ─── */}
        {compareData && (
          <Card sx={{ ...glassCard, mb: 4, p: 3 }}>
            <Typography variant="h5" sx={{ ...sectionTitle, mb: 3 }}>
              <CompareIcon /> Candidate Comparison
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px',
                }}
              >
                <thead>
                  <tr>
                    {['CANDIDATE', 'FIT SCORE', 'FINAL %', 'STRENGTHS', 'GAPS', 'INTEGRITY'].map(
                      (h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: h === 'CANDIDATE' || h === 'STRENGTHS' || h === 'GAPS' ? 'left' : 'center',
                            color: 'rgba(255,255,255,0.5)', fontWeight: 600,
                            padding: '8px 12px', fontSize: '0.8rem',
                          }}
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {compareData.map((c, i) => (
                    <tr
                      key={c.interview_id}
                      style={{
                        background:
                          i === 0
                            ? 'rgba(47,151,247,0.12)'
                            : 'rgba(255,255,255,0.04)',
                        borderRadius: 8,
                      }}
                    >
                      <td style={{ padding: 12, borderRadius: '8px 0 0 8px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          {i === 0 && (
                            <Chip
                              label="#1"
                              size="small"
                              sx={{ background: tealGrad, color: '#fff', fontWeight: 700 }}
                            />
                          )}
                          <Avatar
                            sx={{
                              width: 32, height: 32,
                              background: tealGrad, fontSize: '0.8rem',
                            }}
                          >
                            {c.candidate_name?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography
                              sx={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}
                            >
                              {c.candidate_name}
                            </Typography>
                            <Typography sx={{ ...mutedText, fontSize: '0.75rem' }}>
                              {c.candidate_email}
                            </Typography>
                          </Box>
                        </Box>
                      </td>
                      <td style={{ textAlign: 'center', padding: 12 }}>
                        <Typography
                          sx={{
                            color: scColor(c.overall_fit_score, 10),
                            fontWeight: 800, fontSize: '1.3rem',
                          }}
                        >
                          {c.overall_fit_score?.toFixed(1)}/10
                        </Typography>
                      </td>
                      <td style={{ textAlign: 'center', padding: 12 }}>
                        <Typography
                          sx={{ color: pctColor(c.final_score), fontWeight: 700 }}
                        >
                          {c.final_score?.toFixed(1)}%
                        </Typography>
                      </td>
                      <td style={{ padding: 12 }}>
                        {(c.strengths || []).slice(0, 2).map((s, j) => (
                          <Typography
                            key={j}
                            sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', mb: 0.3 }}
                          >
                            • {s}
                          </Typography>
                        ))}
                      </td>
                      <td style={{ padding: 12 }}>
                        {(c.gaps || []).slice(0, 2).map((g, j) => (
                          <Typography
                            key={j}
                            sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', mb: 0.3 }}
                          >
                            • {g}
                          </Typography>
                        ))}
                      </td>
                      <td
                        style={{
                          textAlign: 'center', padding: 12,
                          borderRadius: '0 8px 8px 0',
                        }}
                      >
                        <Chip
                          size="small"
                          label={c.integrity_signals?.risk_level || 'low'}
                          sx={{
                            background:
                              c.integrity_signals?.risk_level === 'low'
                                ? 'rgba(16,185,129,0.2)'
                                : 'rgba(239,68,68,0.2)',
                            color:
                              c.integrity_signals?.risk_level === 'low'
                                ? '#10B981'
                                : '#EF4444',
                            fontWeight: 600,
                            border: '1px solid',
                            borderColor:
                              c.integrity_signals?.risk_level === 'low'
                                ? 'rgba(16,185,129,0.4)'
                                : 'rgba(239,68,68,0.4)',
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Card>
        )}

        {/* ═══════ MAIN LAYOUT ═══════ */}
        <Grid container spacing={3}>
          {/* ── Left: Candidate list ── */}
          <Grid item xs={12} md={3}>
            <Card sx={{ ...glassCard, position: 'sticky', top: 24 }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, mb: 2 }}>
                  Candidates ({interviews.length})
                </Typography>
                {interviews.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4, color: 'rgba(255,255,255,0.4)' }}>
                    No interviews yet
                  </Box>
                ) : (
                  interviews.map((iv) => (
                    <Paper
                      key={iv.id}
                      sx={{
                        p: 2, mb: 1.5, cursor: 'pointer', borderRadius: 2,
                        background:
                          selectedInterview?.id === iv.id
                            ? 'rgba(47,151,247,0.15)'
                            : 'rgba(255,255,255,0.04)',
                        border:
                          selectedInterview?.id === iv.id
                            ? '2px solid C.primary'
                            : '1px solid rgba(255,255,255,0.08)',
                        transition: 'all 0.2s',
                        '&:hover': {
                          background: 'rgba(47,151,247,0.1)',
                          borderColor: 'rgba(47,151,247,0.4)',
                        },
                      }}
                      onClick={() => {
                        if (!compareMode) setSelectedInterview(iv);
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        {compareMode && (
                          <Checkbox
                            size="small"
                            checked={compareSelected.includes(iv.id)}
                            onChange={() => toggleCompare(iv.id)}
                            sx={{
                              color: 'rgba(255,255,255,0.4)',
                              '&.Mui-checked': { color: 'C.primary' },
                              p: 0,
                            }}
                          />
                        )}
                        <Avatar
                          sx={{
                            width: 36, height: 36,
                            background: tealGrad,
                            fontSize: '0.85rem', fontWeight: 700,
                          }}
                        >
                          {iv.candidate_name?.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            sx={{
                              color: '#fff', fontWeight: 600, fontSize: '0.9rem',
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}
                          >
                            {iv.candidate_name}
                          </Typography>
                          <Typography
                            sx={{
                              ...mutedText, fontSize: '0.75rem',
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}
                          >
                            {iv.candidate_email}
                          </Typography>
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}
                      >
                        <Chip
                          label={iv.status.toUpperCase()}
                          size="small"
                          sx={{
                            background:
                              iv.status === 'completed'
                                ? 'rgba(16,185,129,0.2)'
                                : 'rgba(245,158,11,0.2)',
                            color:
                              iv.status === 'completed' ? '#10B981' : '#F59E0B',
                            fontWeight: 600, fontSize: '0.7rem', height: 22,
                          }}
                        />
                        {iv.final_score != null && (
                          <Typography
                            sx={{
                              color: pctColor(iv.final_score),
                              fontWeight: 700, fontSize: '0.85rem',
                            }}
                          >
                            {iv.final_score.toFixed(1)}%
                          </Typography>
                        )}
                      </Box>
                    </Paper>
                  ))
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* ── Right: Report content ── */}
          <Grid item xs={12} md={9}>
            {!selectedInterview ? (
              <Card sx={{ ...glassCard, p: 6, textAlign: 'center' }}>
                <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem' }}>
                  Select a candidate to view their report
                </Typography>
              </Card>
            ) : selectedInterview.status !== 'completed' ? (
              <Card sx={{ ...glassCard, p: 6, textAlign: 'center' }}>
                <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem' }}>
                  Interview not completed yet
                </Typography>
              </Card>
            ) : reportStatus === 'loading' ? (
              <Card sx={{ ...glassCard, p: 4 }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <CircularProgress size={48} sx={{ color: 'C.primary', mb: 2 }} />
                  <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                    Generating rich candidate report...
                  </Typography>
                  <Typography sx={{ ...mutedText, fontSize: '0.85rem', mt: 1 }}>
                    Running 4 parallel AI analysis calls. This may take up to 60 seconds.
                  </Typography>
                </Box>
                <ReportSkeleton />
              </Card>
            ) : reportStatus === 'idle' ? (
              <Card sx={{ ...glassCard, p: 6, textAlign: 'center' }}>
                <AutoAwesomeIcon
                  sx={{ fontSize: 64, color: 'C.primary', mb: 2, opacity: 0.7 }}
                />
                <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                  Generate Candidate Report
                </Typography>
                <Typography
                  sx={{ ...mutedText, mb: 3, maxWidth: 500, mx: 'auto' }}
                >
                  Click below to generate a comprehensive AI-powered report for{' '}
                  {selectedInterview.candidate_name}. Includes fit scoring, skill rubrics,
                  communication & cognitive analysis, CV deep-dive, and integrity signals.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AutoAwesomeIcon />}
                  onClick={() => handleGenerate()}
                  sx={{
                    background: tealGrad, textTransform: 'none',
                    fontWeight: 700, px: 4, py: 1.5, fontSize: '1rem',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(47,151,247,0.4)',
                    },
                    transition: 'all 0.3s',
                  }}
                >
                  Generate Report
                </Button>
              </Card>
            ) : reportStatus === 'error' ? (
              <Card sx={{ ...glassCard, p: 6, textAlign: 'center' }}>
                <WarningIcon sx={{ fontSize: 64, color: '#EF4444', mb: 2 }} />
                <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                  Report Generation Failed
                </Typography>
                <Button
                  startIcon={<RefreshIcon />}
                  onClick={() => handleGenerate()}
                  sx={{
                    mt: 2, background: tealGrad, color: '#fff',
                    textTransform: 'none', fontWeight: 600,
                  }}
                >
                  Retry
                </Button>
              </Card>
            ) : (
              /* ═══════════ FULL REPORT (13 sections) ═══════════ */
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* ── S1: OVERALL FIT SCORE ── */}
                <Card sx={{ ...glassCard, p: 4 }}>
                  <Box
                    sx={{
                      display: 'flex', alignItems: 'center',
                      gap: 4, flexWrap: 'wrap',
                    }}
                  >
                    <ScoreBadge score={fit.score || 0} max={10} />
                    <Box sx={{ flex: 1, minWidth: 250 }}>
                      <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, mb: 0.5 }}>
                        {selectedInterview.candidate_name}
                      </Typography>
                      <Typography sx={{ ...mutedText, fontSize: '0.85rem', mb: 1 }}>
                        {selectedInterview.candidate_email} •{' '}
                        {fmt(selectedInterview.completed_at)}
                      </Typography>
                      <Typography
                        sx={{
                          color: 'rgba(255,255,255,0.8)',
                          lineHeight: 1.7, fontSize: '0.95rem',
                        }}
                      >
                        {fit.summary || 'No summary available.'}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />

                  <Tabs
                    value={activeTab}
                    onChange={(_, v) => setActiveTab(v)}
                    sx={{
                      mb: 2,
                      '& .MuiTab-root': {
                        color: 'rgba(255,255,255,0.5)', fontWeight: 600,
                        textTransform: 'none', minWidth: 'auto', px: 2,
                        '&.Mui-selected': { color: 'C.primary' },
                      },
                      '& .MuiTabs-indicator': {
                        backgroundColor: 'C.primary', height: 3, borderRadius: 2,
                      },
                    }}
                  >
                    <Tab label="Recommendations" />
                    <Tab label="Strengths" />
                    <Tab label="Gaps" />
                  </Tabs>
                  <Box sx={{ pl: 1 }}>
                    {(activeTab === 0
                      ? fit.recommendations
                      : activeTab === 1
                      ? fit.strengths
                      : fit.gaps
                    )?.map((item, i) => (
                      <Box
                        key={i}
                        sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}
                      >
                        <Box
                          sx={{
                            width: 6, height: 6, borderRadius: '50%', mt: 1, flexShrink: 0,
                            background:
                              activeTab === 1
                                ? '#10B981'
                                : activeTab === 2
                                ? '#EF4444'
                                : 'C.primary',
                          }}
                        />
                        <Typography
                          sx={{
                            color: 'rgba(255,255,255,0.8)',
                            fontSize: '0.9rem', lineHeight: 1.6,
                          }}
                        >
                          {item}
                        </Typography>
                      </Box>
                    )) || <Typography sx={mutedText}>No data</Typography>}
                  </Box>
                </Card>

                {/* ── S2: ASSESSMENT RUBRICS ── */}
                {rubrics.length > 0 && (
                  <Card sx={{ ...glassCard, p: 4 }}>
                    <Typography variant="h6" sx={sectionTitle}>
                      <AssessmentIcon /> Assessment Rubrics
                    </Typography>
                    {rubrics.map((r, i) => (
                      <ExpandableRow
                        key={i}
                        title={`${r.dimension} — ${r.score?.toFixed(1)}/10`}
                        detail={r.explanation}
                        defaultOpen={i === 0}
                      />
                    ))}
                  </Card>
                )}

                {/* ── S3: PRE-SCREENING Q&A ── */}
                {qaPairs.length > 0 && (
                  <Card sx={{ ...glassCard, p: 4 }}>
                    <Typography variant="h6" sx={sectionTitle}>
                      <DescriptionIcon /> Pre-Screening Questions
                    </Typography>
                    {qaPairs
                      .filter((q) => !q.is_followup)
                      .map((qa, i) => (
                        <Paper key={i} sx={{ ...glassCard, p: 2.5, mb: 2 }}>
                          <Typography
                            sx={{
                              color: 'C.primary', fontWeight: 600,
                              fontSize: '0.9rem', mb: 1,
                            }}
                          >
                            Q{i + 1}: {qa.question}
                          </Typography>
                          <Typography
                            sx={{
                              color: 'rgba(255,255,255,0.8)',
                              fontSize: '0.9rem', lineHeight: 1.7,
                            }}
                          >
                            {qa.answer || 'No answer recorded'}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5, flexWrap: 'wrap' }}>
                            {Object.entries(qa.scores || {}).map(([k, v]) => (
                              <Chip
                                key={k}
                                label={`${k.charAt(0).toUpperCase() + k.slice(1)} ${v}`}
                                size="small"
                                sx={{
                                  background: 'rgba(47,151,247,0.15)',
                                  color: pctColor(v),
                                  border: '1px solid rgba(47,151,247,0.3)',
                                  fontSize: '0.7rem', height: 22,
                                }}
                              />
                            ))}
                          </Box>
                        </Paper>
                      ))}
                  </Card>
                )}

                {/* ── S4: AI INTERVIEW TRANSCRIPT ── */}
                {qaPairs.length > 0 && (
                  <Card sx={{ ...glassCard, p: 4 }}>
                    <Typography variant="h6" sx={sectionTitle}>
                      <VoiceIcon /> AI Interview Transcript
                    </Typography>
                    <Box
                      sx={{
                        maxHeight: 500, overflowY: 'auto', pr: 1,
                        '&::-webkit-scrollbar': { width: 6 },
                        '&::-webkit-scrollbar-thumb': {
                          background: 'rgba(255,255,255,0.15)', borderRadius: 3,
                        },
                      }}
                    >
                      {qaPairs.map((qa, i) => (
                        <Box key={i} sx={{ mb: 3 }}>
                          <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                            <Avatar
                              sx={{
                                width: 32, height: 32,
                                background: tealGrad, fontSize: '0.75rem',
                              }}
                            >
                              AI
                            </Avatar>
                            <Paper
                              sx={{
                                p: 2, background: 'rgba(47,151,247,0.1)',
                                border: '1px solid rgba(47,151,247,0.2)',
                                borderRadius: '2px 16px 16px 16px', maxWidth: '85%',
                              }}
                            >
                              <Typography
                                sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem' }}
                              >
                                {qa.question}
                              </Typography>
                            </Paper>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
                            <Paper
                              sx={{
                                p: 2, background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '16px 2px 16px 16px', maxWidth: '85%',
                              }}
                            >
                              <Typography
                                sx={{
                                  color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem',
                                }}
                              >
                                {qa.answer || 'No response'}
                              </Typography>
                            </Paper>
                            <Avatar
                              sx={{
                                width: 32, height: 32,
                                background: emeraldGrad, fontSize: '0.7rem',
                              }}
                            >
                              {selectedInterview.candidate_name?.charAt(0)}
                            </Avatar>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Card>
                )}

                {/* ── S5 & S6: RADAR CHARTS ── */}
                <Grid container spacing={3}>
                  {commData.length > 0 && (
                    <Grid item xs={12} md={6}>
                      <RadarSection
                        title="Communication Skills"
                        icon={<VoiceIcon />}
                        data={commData}
                        color="#2f97f7"
                      />
                    </Grid>
                  )}
                  {cogData.length > 0 && (
                    <Grid item xs={12} md={6}>
                      <RadarSection
                        title="Cognitive Insights"
                        icon={<PsychologyIcon />}
                        data={cogData}
                        color="#8B5CF6"
                      />
                    </Grid>
                  )}
                </Grid>

                {/* ── S7: INTEGRITY / PROCTORING ── */}
                <Card sx={{ ...glassCard, p: 4 }}>
                  <Typography variant="h6" sx={sectionTitle}>
                    <ShieldIcon /> Integrity & Proctoring Signals
                  </Typography>
                  <Grid container spacing={2}>
                    {[
                      {
                        label: 'Multiple Faces Detected',
                        flagged: integrity.multiple_faces,
                        count: integrity.multiple_faces_count,
                      },
                      {
                        label: 'Face Out of View',
                        flagged: integrity.face_out_of_view,
                        count: integrity.face_out_of_view_count,
                      },
                      {
                        label: 'Eye Gaze Off-Screen',
                        flagged: integrity.gaze_flagged,
                        count: integrity.gaze_off_screen_count,
                      },
                    ].map((sig, i) => (
                      <Grid item xs={12} sm={4} key={i}>
                        <Paper
                          sx={{
                            ...glassCard, p: 2.5,
                            display: 'flex', alignItems: 'center', gap: 2,
                          }}
                        >
                          <Box
                            sx={{
                              width: 12, height: 12, borderRadius: '50%',
                              background: sig.flagged ? '#EF4444' : '#10B981',
                              boxShadow: `0 0 10px ${sig.flagged ? '#EF4444' : '#10B981'}`,
                            }}
                          />
                          <Box>
                            <Typography
                              sx={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}
                            >
                              {sig.label}
                            </Typography>
                            <Typography sx={{ ...mutedText, fontSize: '0.8rem' }}>
                              {sig.flagged ? `Flagged (${sig.count} occurrences)` : 'Clear'}
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                  {integrity.risk_level && (
                    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                      <Chip
                        label={`Risk: ${integrity.risk_level?.toUpperCase()}`}
                        sx={{
                          background:
                            integrity.risk_level === 'low'
                              ? 'rgba(16,185,129,0.2)'
                              : 'rgba(239,68,68,0.2)',
                          color:
                            integrity.risk_level === 'low' ? '#10B981' : '#EF4444',
                          fontWeight: 600,
                          border: '1px solid',
                          borderColor:
                            integrity.risk_level === 'low'
                              ? 'rgba(16,185,129,0.4)'
                              : 'rgba(239,68,68,0.4)',
                        }}
                      />
                      <Chip
                        label={`${integrity.total_warnings || 0} warnings`}
                        sx={{
                          background: 'rgba(255,255,255,0.08)',
                          color: 'rgba(255,255,255,0.7)',
                          border: '1px solid rgba(255,255,255,0.15)',
                        }}
                      />
                    </Box>
                  )}
                </Card>

                {/* ── S7b: CV PROCTORING SCREENSHOTS ── */}
                {criticalEvents.length > 0 && (
                  <Card sx={{ ...glassCard, p: 4 }}>
                    <Typography variant="h6" sx={sectionTitle}>
                      <PhotoCameraIcon /> Proctoring Screenshots
                    </Typography>
                    <Typography sx={{ ...mutedText, fontSize: '0.85rem', mb: 3 }}>
                      Flagged moments captured during the interview — high and critical alerts only.
                    </Typography>
                    <Grid container spacing={2}>
                      {criticalEvents.map((evt, i) => (
                        <Grid item xs={12} sm={6} md={4} key={i}>
                          <Paper
                            sx={{
                              ...glassCard, overflow: 'hidden',
                              transition: 'transform 0.2s, box-shadow 0.2s',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                              },
                            }}
                          >
                            <Box
                              component="img"
                              src={`${API_URL}${evt.screenshot}`}
                              alt={evt.type || 'Flagged detection'}
                              sx={{
                                width: '100%', height: 180, objectFit: 'cover',
                                borderBottom: '1px solid rgba(255,255,255,0.08)',
                              }}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                            <Box sx={{ p: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Box
                                  sx={{
                                    width: 8, height: 8, borderRadius: '50%',
                                    background: evt.alert_level === 'critical' ? '#EF4444' : '#F59E0B',
                                    boxShadow: `0 0 8px ${evt.alert_level === 'critical' ? '#EF4444' : '#F59E0B'}`,
                                  }}
                                />
                                <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem', textTransform: 'capitalize' }}>
                                  {(evt.type || 'unknown').replace(/_/g, ' ')}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Chip
                                  label={evt.alert_level?.toUpperCase() || 'HIGH'}
                                  size="small"
                                  sx={{
                                    background: evt.alert_level === 'critical' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)',
                                    color: evt.alert_level === 'critical' ? '#EF4444' : '#F59E0B',
                                    fontWeight: 600, fontSize: '0.7rem', height: 22,
                                    border: `1px solid ${evt.alert_level === 'critical' ? 'rgba(239,68,68,0.4)' : 'rgba(245,158,11,0.4)'}`,
                                  }}
                                />
                                {evt.confidence != null && (
                                  <Chip
                                    label={`${(evt.confidence * 100).toFixed(0)}% conf`}
                                    size="small"
                                    sx={{
                                      background: 'rgba(255,255,255,0.06)',
                                      color: 'rgba(255,255,255,0.6)',
                                      fontSize: '0.7rem', height: 22,
                                    }}
                                  />
                                )}
                              </Box>
                              {evt.message && (
                                <Typography sx={{ ...mutedText, fontSize: '0.78rem', mt: 1, lineHeight: 1.5 }}>
                                  {evt.message}
                                </Typography>
                              )}
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Card>
                )}

                {/* ── S8: VIBE PANEL ── */}
                <Card sx={{ ...glassCard, p: 4 }}>
                  <Typography variant="h6" sx={sectionTitle}>
                    <AutoAwesomeIcon /> Vibe Panel
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ ...glassCard, p: 3, textAlign: 'center' }}>
                        <Typography sx={{ ...mutedText, fontSize: '0.8rem', mb: 1 }}>
                          General Expression
                        </Typography>
                        <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>
                          {vibe.general_expression || '—'}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ ...glassCard, p: 3, textAlign: 'center' }}>
                        <Typography sx={{ ...mutedText, fontSize: '0.8rem', mb: 1 }}>
                          Eye Contact
                        </Typography>
                        <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>
                          {vibe.eye_contact || '—'}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Card>

                {/* ── S9: CV PROFESSIONAL PROFILE RADAR ── */}
                {cvRadar.length > 0 && (
                  <RadarSection
                    title="CV Professional Profile"
                    icon={<DescriptionIcon />}
                    data={cvRadar}
                    color="#10B981"
                  />
                )}

                {/* ── S10: CV RED FLAG ANALYSIS ── */}
                <Card sx={{ ...glassCard, p: 4 }}>
                  <Typography variant="h6" sx={sectionTitle}>
                    <FlagIcon /> CV Red Flag Analysis
                  </Typography>
                  <ExpandableRow
                    title="Timeline & Tenure"
                    flagged={flags.timeline_and_tenure?.flagged}
                    detail={flags.timeline_and_tenure?.detail || 'No data'}
                    defaultOpen
                  />
                  <ExpandableRow
                    title="Experience & Representation"
                    flagged={flags.experience_and_representation?.flagged}
                    detail={flags.experience_and_representation?.detail || 'No data'}
                  />
                  <ExpandableRow
                    title="Other Red Flags"
                    flagged={flags.other?.flagged}
                    detail={flags.other?.detail || 'No data'}
                  />
                </Card>

                {/* ── S11: KEY ATTRIBUTES & POTENTIAL ── */}
                <Card sx={{ ...glassCard, p: 4 }}>
                  <Typography variant="h6" sx={sectionTitle}>
                    <StarIcon /> Key Attributes & Potential
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Paper sx={{ ...glassCard, p: 2.5, textAlign: 'center' }}>
                        <Typography sx={{ ...mutedText, fontSize: '0.75rem', mb: 0.5 }}>
                          Experience Model
                        </Typography>
                        <Typography sx={{ color: '#fff', fontWeight: 700 }}>
                          {attrs.experience_model || '—'}
                        </Typography>
                      </Paper>
                    </Grid>
                    {[
                      { label: 'Leadership', key: 'leadership_potential' },
                      { label: 'Entrepreneurial', key: 'entrepreneurial_spirit' },
                      { label: 'Career Potential', key: 'estimated_career_potential' },
                    ].map(({ label, key }) => (
                      <Grid item xs={6} sm={3} key={key}>
                        <Paper sx={{ ...glassCard, p: 2.5, textAlign: 'center' }}>
                          <Typography sx={{ ...mutedText, fontSize: '0.75rem', mb: 0.5 }}>
                            {label}
                          </Typography>
                          <Typography
                            sx={{
                              color: scColor(attrs[key] || 0, 5),
                              fontWeight: 800, fontSize: '1.3rem',
                            }}
                          >
                            {(attrs[key] || 0).toFixed(1)}/5
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                  {attrs.career_potential_explanation && (
                    <Typography
                      sx={{ ...mutedText, mt: 2, fontSize: '0.9rem', fontStyle: 'italic' }}
                    >
                      {attrs.career_potential_explanation}
                    </Typography>
                  )}
                </Card>

                {/* ── S12: DOCUMENT PROFESSIONALISM ── */}
                <Card sx={{ ...glassCard, p: 4 }}>
                  <Typography variant="h6" sx={sectionTitle}>
                    <DescriptionIcon /> Document Professionalism
                  </Typography>
                  <Grid container spacing={2}>
                    {[
                      { label: 'Attention to Detail', value: docProf.attention_to_detail },
                      {
                        label: 'Clarity & Completeness',
                        value: docProf.clarity_and_completeness,
                      },
                    ].map(({ label, value }) => (
                      <Grid item xs={12} sm={6} key={label}>
                        <Paper sx={{ ...glassCard, p: 3 }}>
                          <Typography sx={{ ...mutedText, fontSize: '0.8rem', mb: 1 }}>
                            {label}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <LinearProgress
                              variant="determinate"
                              value={((value || 0) / 5) * 100}
                              sx={{
                                flex: 1, height: 8, borderRadius: 4,
                                bgcolor: 'rgba(255,255,255,0.08)',
                                '& .MuiLinearProgress-bar': {
                                  background: tealGrad, borderRadius: 4,
                                },
                              }}
                            />
                            <Typography sx={{ color: '#fff', fontWeight: 700, minWidth: 40 }}>
                              {(value || 0).toFixed(1)}/5
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Card>

                {/* ── S13: CV + VIDEO ── */}
                <Card sx={{ ...glassCard, p: 4 }}>
                  <Typography variant="h6" sx={sectionTitle}>
                    <VideocamIcon /> Documents & Recording
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ ...glassCard, p: 3, textAlign: 'center' }}>
                        <DescriptionIcon
                          sx={{ fontSize: 48, color: 'rgba(255,255,255,0.3)', mb: 1 }}
                        />
                        <Typography sx={{ color: '#fff', fontWeight: 600, mb: 1 }}>
                          Candidate CV
                        </Typography>
                        {rd.cv_file_path ? (
                          <Button
                            variant="outlined"
                            size="small"
                            href={`${API_URL}/uploads/${rd.cv_file_path.split('/').pop()}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              borderColor: 'rgba(47,151,247,0.5)',
                              color: 'C.primary', textTransform: 'none', fontWeight: 600,
                            }}
                          >
                            View CV
                          </Button>
                        ) : (
                          <Typography sx={mutedText}>No CV uploaded</Typography>
                        )}
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ ...glassCard, p: 3, textAlign: 'center' }}>
                        <VideocamIcon
                          sx={{ fontSize: 48, color: 'rgba(255,255,255,0.3)', mb: 1 }}
                        />
                        <Typography sx={{ color: '#fff', fontWeight: 600, mb: 1 }}>
                          Interview Recording
                        </Typography>
                        {rd.recording_url ? (
                          <Box sx={{ mt: 1 }}>
                            <video
                              controls
                              width="100%"
                              style={{ borderRadius: 8, maxHeight: 240 }}
                            >
                              <source src={rd.recording_url} />
                            </video>
                          </Box>
                        ) : (
                          <Typography sx={mutedText}>No recording available</Typography>
                        )}
                      </Paper>
                    </Grid>
                  </Grid>
                </Card>

                {/* ── REGENERATE ── */}
                <Box sx={{ textAlign: 'center', pb: 4 }}>
                  <Button
                    startIcon={<RefreshIcon />}
                    onClick={() => handleGenerate(true)}
                    sx={{
                      background: 'rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.6)',
                      textTransform: 'none', fontWeight: 600,
                      '&:hover': { background: 'rgba(255,255,255,0.12)' },
                    }}
                  >
                    Regenerate Report
                  </Button>
                </Box>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default InterviewReport;
