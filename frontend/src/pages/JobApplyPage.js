import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Card, Paper, Button, TextField,
  CircularProgress, Alert, Chip, Divider, Grid
} from '@mui/material';
import {
  Work as WorkIcon, LocationOn as LocationIcon,
  AttachMoney as SalaryIcon, Schedule as ScheduleIcon,
  CloudUpload as UploadIcon, CheckCircle as CheckIcon,
  Business as CompanyIcon
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';

/* ── Styles ── */
const bgGrad = { minHeight: '100vh', background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%)' };
const glassCard = {
  background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
};
const tealGrad = 'linear-gradient(135deg,#0891b2,#06b6d4)';

const JOB_TYPE_LABELS = {
  full_time: 'Full-time', part_time: 'Part-time', contract: 'Contract', internship: 'Internship',
};

export default function JobApplyPage() {
  const { shareToken } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cvFile, setCvFile] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.applications.getPublicJob(shareToken);
        if (res.data.success) setJob(res.data.job);
        else setError('Job not found');
      } catch {
        setError('This job posting is no longer available.');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [shareToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('share_token', shareToken);
      fd.append('candidate_name', name.trim());
      fd.append('candidate_email', email.trim());
      fd.append('candidate_phone', phone.trim());
      if (cvFile) fd.append('cv_file', cvFile);

      const res = await api.applications.apply(fd);
      if (res.data.success) setSubmitted(true);
      else setError(res.data.error || 'Submission failed');
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ ...bgGrad, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: '#06b6d4' }} />
      </Box>
    );
  }

  if (!job) {
    return (
      <Box sx={{ ...bgGrad, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card sx={{ ...glassCard, p: 6, textAlign: 'center', maxWidth: 500 }}>
          <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, mb: 2 }}>Job Not Found</Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>{error || 'This job is no longer accepting applications.'}</Typography>
        </Card>
      </Box>
    );
  }

  // Success state
  if (submitted) {
    return (
      <Box sx={{ ...bgGrad, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card sx={{ ...glassCard, p: 6, textAlign: 'center', maxWidth: 500 }}>
          <CheckIcon sx={{ fontSize: 80, color: '#10b981', mb: 2 }} />
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>Application Submitted!</Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
            Thank you for applying to <strong>{job.title}</strong>. We'll review your application
            and get back to you soon.
          </Typography>
          <Chip label="Check your email for confirmation" sx={{ background: 'rgba(16,185,129,0.2)', color: '#10b981' }} />
        </Card>
      </Box>
    );
  }

  const deadlinePassed = job.application_deadline && new Date(job.application_deadline) < new Date();

  return (
    <Box sx={bgGrad}>
      <Container maxWidth="md" sx={{ py: 6 }}>
        {/* Header */}
        <Card sx={{ ...glassCard, p: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box sx={{
              width: 64, height: 64, borderRadius: '16px', background: tealGrad,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <WorkIcon sx={{ color: '#fff', fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800 }}>{job.title}</Typography>
              {job.company_name && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  <CompanyIcon sx={{ color: '#06b6d4', fontSize: 18 }} />
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>{job.company_name}</Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* Meta chips */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {job.location && (
              <Chip icon={<LocationIcon />} label={job.location}
                sx={{ background: 'rgba(255,255,255,0.08)', color: '#fff', '& .MuiChip-icon': { color: '#06b6d4' } }} />
            )}
            {job.job_type && (
              <Chip icon={<ScheduleIcon />} label={JOB_TYPE_LABELS[job.job_type] || job.job_type}
                sx={{ background: 'rgba(255,255,255,0.08)', color: '#fff', '& .MuiChip-icon': { color: '#06b6d4' } }} />
            )}
            {job.salary_range && (
              <Chip icon={<SalaryIcon />} label={job.salary_range}
                sx={{ background: 'rgba(255,255,255,0.08)', color: '#fff', '& .MuiChip-icon': { color: '#10b981' } }} />
            )}
            <Chip label={`${job.duration_minutes || 20} min interview`}
              sx={{ background: 'rgba(255,255,255,0.08)', color: '#fff' }} />
            {job.application_deadline && (
              <Chip label={`Deadline: ${new Date(job.application_deadline).toLocaleDateString()}`}
                sx={{
                  background: deadlinePassed ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)',
                  color: deadlinePassed ? '#ef4444' : '#fff',
                }} />
            )}
          </Box>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }} />

          {/* Job Description */}
          <Typography variant="h6" sx={{ color: '#06b6d4', fontWeight: 700, mb: 1 }}>About the Role</Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.8)', whiteSpace: 'pre-line', mb: 3, lineHeight: 1.7 }}>
            {job.description}
          </Typography>

          {job.requirements && (
            <>
              <Typography variant="h6" sx={{ color: '#06b6d4', fontWeight: 700, mb: 1 }}>Requirements</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.8)', whiteSpace: 'pre-line', lineHeight: 1.7 }}>
                {job.requirements}
              </Typography>
            </>
          )}
        </Card>

        {/* Application Form */}
        {deadlinePassed ? (
          <Card sx={{ ...glassCard, p: 4, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: '#ef4444', fontWeight: 700 }}>Applications Closed</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.6)', mt: 1 }}>
              The deadline for this position has passed.
            </Typography>
          </Card>
        ) : (
          <Card sx={{ ...glassCard, p: 4 }}>
            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, mb: 3 }}>Apply Now</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth required label="Full Name" value={name}
                    onChange={e => setName(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: '#fff',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                        '&:hover fieldset': { borderColor: '#06b6d4' },
                        '&.Mui-focused fieldset': { borderColor: '#06b6d4' },
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#06b6d4' },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth required label="Email" type="email" value={email}
                    onChange={e => setEmail(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: '#fff',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                        '&:hover fieldset': { borderColor: '#06b6d4' },
                        '&.Mui-focused fieldset': { borderColor: '#06b6d4' },
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#06b6d4' },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth label="Phone" value={phone}
                    onChange={e => setPhone(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: '#fff',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                        '&:hover fieldset': { borderColor: '#06b6d4' },
                        '&.Mui-focused fieldset': { borderColor: '#06b6d4' },
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#06b6d4' },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    component="label" variant="outlined" fullWidth
                    startIcon={<UploadIcon />}
                    sx={{
                      height: 56, borderColor: 'rgba(255,255,255,0.2)', color: '#fff',
                      textTransform: 'none', justifyContent: 'flex-start', pl: 2,
                      '&:hover': { borderColor: '#06b6d4' },
                    }}
                  >
                    {cvFile ? cvFile.name : 'Upload CV (PDF/DOCX)'}
                    <input type="file" hidden accept=".pdf,.doc,.docx"
                      onChange={e => setCvFile(e.target.files[0])} />
                  </Button>
                </Grid>
              </Grid>

              <Button
                type="submit" variant="contained" size="large" fullWidth
                disabled={submitting}
                sx={{
                  mt: 3, py: 1.5, background: tealGrad, fontWeight: 700,
                  textTransform: 'none', fontSize: '1.1rem',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(8,145,178,0.4)' },
                  transition: 'all 0.3s',
                }}
              >
                {submitting ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Submit Application'}
              </Button>
            </Box>

            <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', mt: 2, textAlign: 'center' }}>
              By applying, you agree to have your CV analyzed by our AI screening system.
            </Typography>
          </Card>
        )}
      </Container>
    </Box>
  );
}
