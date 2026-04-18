import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Typography, Box, Card, Button, Chip, CircularProgress, alpha
} from '@mui/material';
import {
  CalendarMonth as CalIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckIcon,
  SwapHoriz as RescheduleIcon,
  ArrowBack as BackIcon,
  EventAvailable as ConfirmIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const C = {
  bg: '#0b1120', primary: '#2f97f7', accent: '#0ea5e9',
  text: '#e2e8f0', textMuted: '#94a3b8',
  bgCard: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)',
  success: '#22c55e', warning: '#f59e0b', error: '#ef4444'
};

const glassCard = {
  background: C.bgCard, backdropFilter: 'blur(24px)',
  border: `1px solid ${C.border}`, borderRadius: '16px'
};

const SchedulePage = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      // Check if already scheduled
      const schedRes = await api.applications.getMySchedule(applicationId).catch(() => null);
      if (schedRes?.data?.schedule) {
        setSchedule(schedRes.data.schedule);
      }
      // Load available slots
      const slotsRes = await api.applications.getAvailableSlots(applicationId);
      setSlots(slotsRes.data.slots || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load scheduling data');
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => { load(); }, [load]);

  // Group slots by date
  const grouped = slots.reduce((acc, slot) => {
    const date = new Date(slot).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {});

  const handleBook = async () => {
    if (!selected) return;
    try {
      setBooking(true);
      setError('');
      await api.applications.bookSlot(applicationId, selected);
      setSuccess('Interview scheduled successfully! You will receive a confirmation email.');
      setSelected(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to book slot');
    } finally {
      setBooking(false);
    }
  };

  const handleReschedule = async () => {
    if (!selected || !schedule) return;
    try {
      setBooking(true);
      setError('');
      await api.applications.reschedule(schedule.id, selected);
      setSuccess('Interview rescheduled successfully!');
      setSelected(null);
      setShowReschedule(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reschedule');
    } finally {
      setBooking(false);
    }
  };

  const fmtTime = (iso) => new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const fmtDateTime = (iso) => new Date(iso).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) return (
    <Box sx={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
      <CircularProgress sx={{ color: C.primary }} />
      <Typography sx={{ color: C.textMuted }}>Loading available slots...</Typography>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', background: C.bg, py: 5 }}>
      <Container maxWidth="md">
        {/* Back */}
        <Box onClick={() => navigate('/my-interviews')} sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 4, cursor: 'pointer', color: C.textMuted, '&:hover': { color: C.primary } }}>
          <BackIcon fontSize="small" />
          <Typography sx={{ fontSize: '0.9rem' }}>Back to Dashboard</Typography>
        </Box>

        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <CalIcon sx={{ fontSize: 48, color: C.primary, mb: 1 }} />
          <Typography sx={{ color: C.text, fontWeight: 800, fontSize: '2rem' }}>
            Schedule Your Interview
          </Typography>
          <Typography sx={{ color: C.textMuted, mt: 1 }}>
            Pick a time slot that works best for you
          </Typography>
        </Box>

        {/* Messages */}
        {error && (
          <Card sx={{ ...glassCard, p: 2, mb: 3, border: `1px solid ${alpha(C.error, 0.3)}`, background: alpha(C.error, 0.08) }}>
            <Typography sx={{ color: C.error, textAlign: 'center' }}>{error}</Typography>
          </Card>
        )}
        {success && (
          <Card sx={{ ...glassCard, p: 2, mb: 3, border: `1px solid ${alpha(C.success, 0.3)}`, background: alpha(C.success, 0.08) }}>
            <Typography sx={{ color: C.success, textAlign: 'center' }}>{success}</Typography>
          </Card>
        )}

        {/* Current Schedule */}
        {schedule && !showReschedule && (
          <Card sx={{ ...glassCard, p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <ConfirmIcon sx={{ color: C.success }} />
              <Typography sx={{ color: C.text, fontWeight: 700, fontSize: '1.1rem' }}>Your Scheduled Interview</Typography>
            </Box>
            <Box sx={{ p: 2.5, borderRadius: '12px', background: alpha(C.success, 0.06), border: `1px solid ${alpha(C.success, 0.15)}` }}>
              <Typography sx={{ color: C.text, fontWeight: 600, fontSize: '1.1rem' }}>
                {fmtDateTime(schedule.scheduled_time)}
              </Typography>
              <Typography sx={{ color: C.textMuted, fontSize: '0.85rem', mt: 0.5 }}>
                Duration: 30 minutes • Status: {schedule.status}
              </Typography>
            </Box>
            {schedule.can_reschedule && (
              <Button
                onClick={() => setShowReschedule(true)}
                startIcon={<RescheduleIcon />}
                sx={{ mt: 2, color: C.warning, borderColor: alpha(C.warning, 0.3), '&:hover': { borderColor: C.warning, bgcolor: alpha(C.warning, 0.08) } }}
                variant="outlined" size="small"
              >
                Reschedule (1 time only)
              </Button>
            )}
          </Card>
        )}

        {/* Slot Picker — Show if no schedule OR rescheduling */}
        {(!schedule || showReschedule) && (
          <>
            {showReschedule && (
              <Card sx={{ ...glassCard, p: 2, mb: 3, textAlign: 'center', background: alpha(C.warning, 0.04), border: `1px solid ${alpha(C.warning, 0.15)}` }}>
                <Typography sx={{ color: C.warning, fontWeight: 600 }}>
                  ⚠️ You can only reschedule once. Pick your new time carefully.
                </Typography>
                <Button onClick={() => { setShowReschedule(false); setSelected(null); }} sx={{ mt: 1, color: C.textMuted }} size="small">
                  Cancel Reschedule
                </Button>
              </Card>
            )}

            {Object.keys(grouped).length === 0 ? (
              <Card sx={{ ...glassCard, p: 4, textAlign: 'center' }}>
                <Typography sx={{ color: C.textMuted }}>No available slots at the moment. Please check back later.</Typography>
              </Card>
            ) : (
              <>
                {Object.entries(grouped).map(([date, dateSlots]) => (
                  <Card key={date} sx={{ ...glassCard, p: 3, mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <CalIcon sx={{ color: C.primary, fontSize: 20 }} />
                      <Typography sx={{ color: C.text, fontWeight: 700 }}>{date}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                      {dateSlots.map((slot) => {
                        const isSelected = selected === slot;
                        return (
                          <Chip
                            key={slot}
                            icon={<TimeIcon sx={{ fontSize: 16 }} />}
                            label={fmtTime(slot)}
                            onClick={() => setSelected(isSelected ? null : slot)}
                            sx={{
                              py: 2.5, px: 1, fontSize: '0.9rem', fontWeight: 600,
                              bgcolor: isSelected ? alpha(C.primary, 0.2) : alpha(C.textMuted, 0.06),
                              color: isSelected ? C.primary : C.text,
                              border: `1px solid ${isSelected ? C.primary : C.border}`,
                              '&:hover': { bgcolor: alpha(C.primary, 0.12), borderColor: C.primary },
                              cursor: 'pointer'
                            }}
                          />
                        );
                      })}
                    </Box>
                  </Card>
                ))}

                {/* Confirm */}
                {selected && (
                  <Card sx={{ ...glassCard, p: 3, textAlign: 'center', position: 'sticky', bottom: 20, border: `1px solid ${alpha(C.primary, 0.3)}`, background: alpha(C.primary, 0.06) }}>
                    <Typography sx={{ color: C.text, fontWeight: 600, mb: 2 }}>
                      Selected: {fmtDateTime(selected)}
                    </Typography>
                    <Button
                      onClick={showReschedule ? handleReschedule : handleBook}
                      disabled={booking}
                      startIcon={booking ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <CheckIcon />}
                      sx={{
                        px: 4, py: 1.2, fontWeight: 700, borderRadius: '10px', textTransform: 'none',
                        background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`,
                        color: '#fff', '&:hover': { opacity: 0.9 }, '&:disabled': { opacity: 0.5, color: '#fff' }
                      }}
                    >
                      {booking ? 'Confirming...' : showReschedule ? 'Confirm Reschedule' : 'Confirm Booking'}
                    </Button>
                  </Card>
                )}
              </>
            )}
          </>
        )}

        {/* Info */}
        <Card sx={{ ...glassCard, mt: 4, p: 3, textAlign: 'center', background: alpha(C.primary, 0.04), border: `1px solid ${alpha(C.primary, 0.15)}` }}>
          <Typography sx={{ color: C.text, fontWeight: 700, mb: 1 }}>ℹ️ Interview Guidelines</Typography>
          <Typography sx={{ color: C.textMuted, fontSize: '0.9rem', maxWidth: 500, mx: 'auto' }}>
            Each interview lasts ~30 minutes. You'll receive a reminder email 1 hour before and an interview link 5 minutes before start. Ensure stable internet and a quiet environment.
          </Typography>
        </Card>
      </Container>
    </Box>
  );
};

export default SchedulePage;
