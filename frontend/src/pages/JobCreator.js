import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Button, TextField, Grid, Card, CardContent,
  Chip, Alert, CircularProgress, IconButton, Tooltip, Snackbar,
  Stepper, Step, StepLabel, StepConnector, LinearProgress, Fade, Divider,
} from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import WorkIcon from '@mui/icons-material/Work';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import TimerIcon from '@mui/icons-material/Timer';
import PreviewIcon from '@mui/icons-material/Visibility';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SettingsIcon from '@mui/icons-material/Settings';

const C = {
  primary: '#2f97f7', accent: '#0ea5e9', bg: '#0b1120',
  bgCard: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)',
  borderActive: 'rgba(47,151,247,0.4)',
  text: '#e2e8f0', textMuted: '#94a3b8', textDim: '#64748b',
  success: '#10b981', warning: '#f59e0b', error: '#ef4444',
};

const glassCard = {
  background: C.bgCard, backdropFilter: 'blur(24px)',
  border: '1px solid '+C.border, borderRadius: '16px',
};
const inputSx = {
  '& .MuiOutlinedInput-root': {
    color: C.text, background: 'rgba(255,255,255,0.03)',
    '& fieldset': { borderColor: C.border },
    '&:hover fieldset': { borderColor: C.primary },
    '&.Mui-focused fieldset': { borderColor: C.primary, borderWidth: 2 },
  },
  '& .MuiInputLabel-root': { color: C.textMuted, '&.Mui-focused': { color: C.primary } },
  '& input::placeholder, & textarea::placeholder': { color: C.textDim },
};
const primaryBtn = {
  background: 'linear-gradient(135deg, '+C.primary+', '+C.accent+')',
  color: '#fff', fontWeight: 700, borderRadius: '12px', textTransform: 'none',
  px: 4, py: 1.5,
  boxShadow: '0 4px 20px '+alpha(C.primary, 0.3),
  '&:hover': {
    background: 'linear-gradient(135deg, '+C.accent+', '+C.primary+')',
    boxShadow: '0 8px 30px '+alpha(C.primary, 0.4),
    transform: 'translateY(-2px)',
  },
  transition: 'all 0.3s ease',
  '&:disabled': { background: 'rgba(255,255,255,0.06)', color: C.textDim },
};

/* ── Custom Stepper Styling ── */
const GlowConnector = styled(StepConnector)(() => ({
  '& .MuiStepConnector-line': {
    borderColor: 'rgba(255,255,255,0.08)', borderTopWidth: 2,
  },
  '&.Mui-active .MuiStepConnector-line, &.Mui-completed .MuiStepConnector-line': {
    borderColor: C.primary,
  },
}));

const stepIconSx = (active, completed) => ({
  width: 36, height: 36, borderRadius: '50%', display: 'flex',
  alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem',
  transition: 'all 0.3s ease',
  background: completed
    ? 'linear-gradient(135deg, '+C.success+', #34d399)'
    : active
    ? 'linear-gradient(135deg, '+C.primary+', '+C.accent+')'
    : 'rgba(255,255,255,0.06)',
  color: completed || active ? '#fff' : C.textDim,
  boxShadow: completed
    ? '0 0 16px '+alpha(C.success, 0.4)
    : active
    ? '0 0 16px '+alpha(C.primary, 0.4)
    : 'none',
});

const steps = [
  { label: 'Job Details', icon: <WorkIcon sx={{ fontSize: 16 }} /> },
  { label: 'Pipeline', icon: <SettingsIcon sx={{ fontSize: 16 }} /> },
  { label: 'Questions', icon: <HelpOutlineIcon sx={{ fontSize: 16 }} /> },
  { label: 'Scoring', icon: <AssessmentIcon sx={{ fontSize: 16 }} /> },
];

const JobCreator = () => {
  const navigate = useNavigate();
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    requirements: '',
    duration_minutes: 20,
    max_cv_uploads: 100,
    link_active_days: 14,
    max_shortlist: 5,
    scheduling_window_days: 7,
    max_concurrent_interviews: 3,
    must_ask_questions: [''],
    scoring_criteria: {
      technical_skills: { weight: 0.4, description: 'Technical knowledge and problem-solving' },
      communication: { weight: 0.3, description: 'Communication clarity and confidence' },
      behavioral: { weight: 0.2, description: 'Team fit and professional behavior' },
      experience: { weight: 0.1, description: 'Relevant experience and background' },
    },
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [interviewLink, setInterviewLink] = useState('');
  const [copied, setCopied] = useState(false);

  const handleInput = (e) => {
    const { name, value } = e.target;
    const numericFields = ['duration_minutes', 'max_cv_uploads', 'link_active_days', 'max_shortlist', 'scheduling_window_days', 'max_concurrent_interviews'];
    setJobData(prev => ({ ...prev, [name]: numericFields.includes(name) ? parseInt(value) || 0 : value }));
  };

  const handleScoring = (key, field, value) => {
    setJobData(prev => ({
      ...prev,
      scoring_criteria: {
        ...prev.scoring_criteria,
        [key]: { ...prev.scoring_criteria[key], [field]: field === 'weight' ? parseFloat(value) || 0 : value },
      },
    }));
  };

  const handleQuestionChange = (idx, value) => {
    const q = [...jobData.must_ask_questions];
    q[idx] = value;
    setJobData(prev => ({ ...prev, must_ask_questions: q }));
  };
  const addQuestion = () => setJobData(prev => ({ ...prev, must_ask_questions: [...prev.must_ask_questions, ''] }));
  const removeQuestion = (idx) => {
    const q = jobData.must_ask_questions.filter((_, i) => i !== idx);
    setJobData(prev => ({ ...prev, must_ask_questions: q.length ? q : [''] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      if (!jobData.title || !jobData.description) throw new Error('Please fill in all required fields');

      const totalWeight = Object.values(jobData.scoring_criteria).reduce((s, c) => s + (c.weight || 0), 0);
      if (Math.abs(totalWeight - 1.0) > 0.01) throw new Error('Scoring criteria weights must sum to 1.0');

      const filteredQuestions = jobData.must_ask_questions.filter(q => q.trim());
      const payload = {
        title: jobData.title,
        description: jobData.description,
        requirements: jobData.requirements,
        duration_minutes: jobData.duration_minutes,
        max_cv_uploads: jobData.max_cv_uploads,
        link_active_days: jobData.link_active_days,
        max_shortlist: jobData.max_shortlist,
        scheduling_window_days: jobData.scheduling_window_days,
        max_concurrent_interviews: jobData.max_concurrent_interviews,
        scoring_criteria: jobData.scoring_criteria,
        must_ask_questions: filteredQuestions.length ? filteredQuestions : undefined,
      };

      const response = await api.jobs.create(payload);
      setSuccess(true);
      setInterviewLink(window.location.origin+'/interview/'+response.data.job.id);
      setJobData({
        title: '', description: '', requirements: '', duration_minutes: 20,
        max_cv_uploads: 100, link_active_days: 14, max_shortlist: 5,
        scheduling_window_days: 7, max_concurrent_interviews: 3,
        must_ask_questions: [''],
        scoring_criteria: {
          technical_skills: { weight: 0.4, description: 'Technical knowledge and problem-solving' },
          communication: { weight: 0.3, description: 'Communication clarity and confidence' },
          behavioral: { weight: 0.2, description: 'Team fit and professional behavior' },
          experience: { weight: 0.1, description: 'Relevant experience and background' },
        },
      });
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to create job');
    } finally { setLoading(false); }
  };

  const copyLink = () => { navigator.clipboard.writeText(interviewLink); setCopied(true); };

  const totalWeight = Object.values(jobData.scoring_criteria).reduce((s, c) => s + c.weight, 0);
  const weightValid = Math.abs(totalWeight - 1.0) < 0.01;

  /* ── Completion tracking ── */
  const completion = useMemo(() => {
    let filled = 0, total = 5;
    if (jobData.title.trim()) filled++;
    if (jobData.description.trim()) filled++;
    if (jobData.max_shortlist > 0 && jobData.link_active_days > 0) filled++;
    if (jobData.must_ask_questions.some(q => q.trim())) filled++;
    if (weightValid) filled++;
    return Math.round((filled / total) * 100);
  }, [jobData, weightValid]);

  const activeStep = useMemo(() => {
    if (!jobData.title.trim() || !jobData.description.trim()) return 0;
    if (!(jobData.max_shortlist > 0 && jobData.link_active_days > 0)) return 1;
    if (!jobData.must_ask_questions.some(q => q.trim())) return 2;
    return 3;
  }, [jobData]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: C.bg, position: 'relative' }}>
      {/* Ambient background glow */}
      <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: '20%', left: '10%', width: 500, height: 500, borderRadius: '50%', background: alpha(C.primary, 0.03), filter: 'blur(120px)' }} />
        <Box sx={{ position: 'absolute', bottom: '10%', right: '15%', width: 400, height: 400, borderRadius: '50%', background: alpha(C.accent, 0.025), filter: 'blur(100px)' }} />
      </Box>

      {/* Top bar */}
      <Box sx={{ px: 4, py: 2, display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid '+C.border, bgcolor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 10 }}>
        <IconButton onClick={() => navigate('/dashboard')} sx={{ color: C.textMuted, '&:hover': { color: C.text } }}>
          <ArrowBackIcon />
        </IconButton>
        <WorkIcon sx={{ color: C.primary }} />
        <Typography sx={{ color: C.text, fontWeight: 700, fontSize: '1.1rem', flex: 1 }}>Create Interview Job</Typography>
        {/* Completion badge */}
        <Chip
          label={`${completion}% complete`}
          size="small"
          sx={{
            background: completion === 100
              ? 'linear-gradient(135deg, '+C.success+', #34d399)'
              : alpha(C.primary, 0.15),
            color: completion === 100 ? '#fff' : C.primary,
            fontWeight: 700, fontSize: '0.75rem',
            border: '1px solid '+(completion === 100 ? alpha(C.success, 0.4) : alpha(C.primary, 0.3)),
          }}
        />
      </Box>

      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 4, position: 'relative', zIndex: 1 }}>
        {/* Header + Stepper */}
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Typography sx={{ color: C.text, fontWeight: 800, fontSize: '2.2rem', mb: 0.5, letterSpacing: '-0.02em' }}>
            Create AI Interview
          </Typography>
          <Typography sx={{ color: C.textMuted, fontSize: '1rem', mb: 4 }}>
            Set up a new AI-powered interview with custom questions and scoring criteria
          </Typography>

          {/* Stepper */}
          <Box sx={{ maxWidth: 500, mx: 'auto' }}>
            <Stepper activeStep={activeStep} connector={<GlowConnector />}>
              {steps.map((step, i) => (
                <Step key={step.label} completed={i < activeStep}>
                  <StepLabel
                    StepIconComponent={() => (
                      <Box sx={stepIconSx(i === activeStep, i < activeStep)}>
                        {i < activeStep ? <CheckCircleIcon sx={{ fontSize: 18 }} /> : step.icon}
                      </Box>
                    )}
                  >
                    <Typography sx={{ color: i <= activeStep ? C.text : C.textDim, fontWeight: 600, fontSize: '0.8rem' }}>
                      {step.label}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        </Box>

        {/* Success banner */}
        {success && (
          <Card sx={{ ...glassCard, mb: 3, p: 3, borderColor: alpha(C.success, 0.4) }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CheckCircleIcon sx={{ color: C.success }} />
              <Typography sx={{ color: C.success, fontWeight: 700 }}>Job created successfully!</Typography>
            </Box>
            <Typography sx={{ color: C.textMuted, mb: 1.5, fontSize: '.9rem' }}>Share the interview link with candidates:</Typography>
            <Box sx={{ p: 2, bgcolor: alpha(C.primary, 0.06), borderRadius: '10px', border: '1px solid '+C.border, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ color: C.primary, fontWeight: 600, fontSize: '.9rem', wordBreak: 'break-all' }}>{interviewLink}</Typography>
              <Tooltip title="Copy Link">
                <IconButton onClick={copyLink} sx={{ color: C.primary }}><ContentCopyIcon /></IconButton>
              </Tooltip>
            </Box>
          </Card>
        )}

        {error && (
          <Alert severity="error" onClose={() => setError('')}
            sx={{ mb: 3, bgcolor: alpha(C.error, 0.1), color: C.error, border: '1px solid '+alpha(C.error, 0.3), '& .MuiAlert-icon': { color: C.error } }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Left column: Job Info + Must-Ask Questions */}
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Job Information */}
                <Card sx={{ ...glassCard, transition: 'border-color 0.3s', '&:hover': { borderColor: alpha(C.primary, 0.2) } }}>
                  <CardContent sx={{ p: 3.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                      <Box sx={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, '+C.primary+', '+C.accent+')', color: '#fff', fontWeight: 800, fontSize: '0.8rem' }}>1</Box>
                      <Box>
                        <Typography sx={{ color: C.text, fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.2 }}>Job Information</Typography>
                        <Typography sx={{ color: C.textDim, fontSize: '0.75rem' }}>Define the role and requirements</Typography>
                      </Box>
                    </Box>
                    <Grid container spacing={2.5}>
                      <Grid item xs={12}>
                        <TextField name="title" label="Job Title" value={jobData.title} onChange={handleInput}
                          fullWidth required placeholder="e.g. Senior Software Engineer" sx={inputSx} />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField name="description" label="Job Description" value={jobData.description} onChange={handleInput}
                          fullWidth multiline rows={4} required placeholder="Describe the role, responsibilities, and key requirements..." sx={inputSx} />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField name="requirements" label="Requirements (Optional)" value={jobData.requirements} onChange={handleInput}
                          fullWidth multiline rows={3} placeholder="Technical skills, experience level, education..." sx={inputSx} />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField name="duration_minutes" label="Interview Duration (minutes)" type="number" value={jobData.duration_minutes} onChange={handleInput}
                          fullWidth inputProps={{ min: 5, max: 60 }} sx={inputSx} />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Pipeline Settings */}
                <Card sx={{ ...glassCard, transition: 'border-color 0.3s', '&:hover': { borderColor: alpha(C.accent, 0.2) } }}>
                  <CardContent sx={{ p: 3.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                      <Box sx={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, '+C.accent+', #38bdf8)', color: '#fff', fontWeight: 800, fontSize: '0.8rem' }}>2</Box>
                      <Box>
                        <Typography sx={{ color: C.text, fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.2 }}>Pipeline Settings</Typography>
                        <Typography sx={{ color: C.textDim, fontSize: '0.75rem' }}>Control applications, scheduling &amp; interview capacity</Typography>
                      </Box>
                    </Box>
                    <Grid container spacing={2.5}>
                      <Grid item xs={12} sm={6}>
                        <TextField name="max_cv_uploads" label="Max CV Uploads" type="number" value={jobData.max_cv_uploads} onChange={handleInput}
                          fullWidth helperText="Maximum CVs accepted for this job" inputProps={{ min: 1, max: 10000 }}
                          sx={inputSx} FormHelperTextProps={{ sx: { color: C.textDim } }} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField name="link_active_days" label="Link Active (days)" type="number" value={jobData.link_active_days} onChange={handleInput}
                          fullWidth helperText="Days the apply link stays active" inputProps={{ min: 1, max: 90 }}
                          sx={inputSx} FormHelperTextProps={{ sx: { color: C.textDim } }} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField name="max_shortlist" label="Shortlist Count" type="number" value={jobData.max_shortlist} onChange={handleInput}
                          fullWidth helperText="Top N candidates to shortlist from ATS" inputProps={{ min: 1, max: 500 }}
                          sx={inputSx} FormHelperTextProps={{ sx: { color: C.textDim } }} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField name="scheduling_window_days" label="Scheduling Window (days)" type="number" value={jobData.scheduling_window_days} onChange={handleInput}
                          fullWidth helperText="Days within which interviews are scheduled" inputProps={{ min: 1, max: 30 }}
                          sx={inputSx} FormHelperTextProps={{ sx: { color: C.textDim } }} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField name="max_concurrent_interviews" label="Max Concurrent Interviews" type="number" value={jobData.max_concurrent_interviews} onChange={handleInput}
                          fullWidth helperText="Max interviews running at same time (server capacity)" inputProps={{ min: 1, max: 10 }}
                          sx={inputSx} FormHelperTextProps={{ sx: { color: C.textDim } }} />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Must-Ask Questions */}
                <Card sx={{ ...glassCard, transition: 'border-color 0.3s', '&:hover': { borderColor: alpha(C.warning, 0.2) } }}>
                  <CardContent sx={{ p: 3.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                      <Box sx={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, '+C.warning+', #fbbf24)', color: '#fff', fontWeight: 800, fontSize: '0.8rem' }}>3</Box>
                      <Box>
                        <Typography sx={{ color: C.text, fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.2 }}>Must-Ask Questions</Typography>
                        <Typography sx={{ color: C.textDim, fontSize: '0.75rem' }}>Questions the AI interviewer must cover</Typography>
                      </Box>
                    </Box>
                    <Typography sx={{ color: C.textMuted, fontSize: '.85rem', mb: 2.5 }}>
                      These questions will be sent to the AI interviewer alongside the job description. The AI will ensure these are asked during the interview.
                    </Typography>
                    {jobData.must_ask_questions.map((q, idx) => (
                      <Box key={idx} sx={{ display: 'flex', gap: 1, mb: 1.5, alignItems: 'flex-start' }}>
                        <Typography sx={{ color: C.textDim, fontWeight: 700, mt: 1.2, minWidth: 24 }}>{idx + 1}.</Typography>
                        <TextField value={q} onChange={(e) => handleQuestionChange(idx, e.target.value)}
                          fullWidth placeholder="e.g. What experience do you have with microservices?" sx={inputSx} size="small" />
                        <IconButton onClick={() => removeQuestion(idx)} sx={{ color: C.error, mt: 0.3, '&:hover': { bgcolor: alpha(C.error, 0.1) } }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                    <Button startIcon={<AddIcon />} onClick={addQuestion}
                      sx={{ mt: 1, color: C.primary, textTransform: 'none', '&:hover': { bgcolor: alpha(C.primary, 0.08) } }}>
                      Add Question
                    </Button>
                  </CardContent>
                </Card>
              </Box>
            </Grid>

            {/* Right column: Scoring Criteria */}
            <Grid item xs={12} md={4}>
              <Card sx={{ ...glassCard, position: 'sticky', top: 80, transition: 'border-color 0.3s', '&:hover': { borderColor: alpha('#8b5cf6', 0.2) } }}>
                <CardContent sx={{ p: 3.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', color: '#fff', fontWeight: 800, fontSize: '0.8rem' }}>4</Box>
                    <Box>
                      <Typography sx={{ color: C.text, fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.2 }}>Scoring Criteria</Typography>
                      <Typography sx={{ color: C.textDim, fontSize: '0.75rem' }}>Weights must sum to 1.0</Typography>
                    </Box>
                  </Box>

                  {Object.entries(jobData.scoring_criteria).map(([key, criteria]) => (
                    <Box key={key} sx={{ mb: 2.5, p: 2, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid '+alpha(C.border, 0.5) }}>
                      <Typography sx={{ color: C.primary, fontWeight: 700, fontSize: '.85rem', mb: 1.5, textTransform: 'capitalize' }}>
                        {key.replace(/_/g, ' ')}
                      </Typography>
                      <TextField label="Weight" type="number" value={criteria.weight}
                        onChange={(e) => handleScoring(key, 'weight', e.target.value)}
                        size="small" fullWidth sx={{ ...inputSx, mb: 1.5 }}
                        inputProps={{ min: 0, max: 1, step: 0.1 }} />
                      <TextField label="Description" value={criteria.description}
                        onChange={(e) => handleScoring(key, 'description', e.target.value)}
                        size="small" fullWidth multiline rows={2} sx={inputSx} />
                    </Box>
                  ))}

                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Chip
                      label={'Total Weight: '+totalWeight.toFixed(1)}
                      sx={{
                        fontWeight: 700, fontSize: '.9rem', py: 2,
                        background: weightValid
                          ? 'linear-gradient(135deg, '+C.success+', #34d399)'
                          : 'linear-gradient(135deg, '+C.error+', #f87171)',
                        color: '#fff',
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Submit */}
            <Grid item xs={12}>
              <Card sx={{ ...glassCard, p: 3, mt: 1, background: alpha(C.primary, 0.04), border: '1px solid '+alpha(C.primary, 0.15) }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                  <Box>
                    <Typography sx={{ color: C.text, fontWeight: 700, fontSize: '1rem' }}>
                      {completion === 100 ? 'Ready to launch!' : 'Complete all fields to create'}
                    </Typography>
                    <Typography sx={{ color: C.textMuted, fontSize: '0.8rem' }}>
                      {completion === 100
                        ? 'Your AI interview is configured and ready to go'
                        : `${completion}% complete — fill required fields above`}
                    </Typography>
                  </Box>
                  <Button type="submit" disabled={loading} startIcon={loading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <RocketLaunchIcon />} sx={{ ...primaryBtn, px: 5, py: 1.5, fontSize: '1rem' }}>
                    {loading ? 'Creating...' : 'Launch Interview'}
                  </Button>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={completion}
                  sx={{
                    mt: 2, height: 4, borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.06)',
                    '& .MuiLinearProgress-bar': {
                      background: completion === 100 ? 'linear-gradient(90deg, '+C.success+', #34d399)' : 'linear-gradient(90deg, '+C.primary+', '+C.accent+')',
                      borderRadius: 2,
                    },
                  }}
                />
              </Card>
            </Grid>
          </Grid>
        </form>
      </Box>

      <Snackbar open={copied} autoHideDuration={2000} onClose={() => setCopied(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success" sx={{ bgcolor: '#1a2332', color: C.text, border: '1px solid '+C.border }}>
          Link copied to clipboard
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default JobCreator;
