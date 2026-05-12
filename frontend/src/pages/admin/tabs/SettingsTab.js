import React from 'react';
import { Box, Typography, Button, Card, Grid, Divider, Switch } from '@mui/material';
import { alpha } from '@mui/material/styles';
import WarningIcon from '@mui/icons-material/Warning';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import BlockIcon from '@mui/icons-material/Block';
import BuildIcon from '@mui/icons-material/Build';
import SettingsIcon from '@mui/icons-material/Settings';
import SendIcon from '@mui/icons-material/Send';

import { C, glassCardStatic, primaryBtn, sectionTitle } from '../constants';

function SosToggle({ label, settingKey, icon, danger, value, onChange }) {
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      p: 2, borderRadius: '12px', mb: 1.5,
      border: `1px solid ${danger ? alpha(C.error, 0.3) : C.border}`,
      background: danger ? alpha(C.error, 0.04) : 'transparent',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {icon}
        <Box>
          <Typography sx={{ fontWeight: 600, color: C.text, fontSize: '.9rem' }}>{label}</Typography>
          <Typography sx={{ fontSize: '.75rem', color: C.textDim }}>
            Currently: {value ? 'ON' : 'OFF'}
          </Typography>
        </Box>
      </Box>
      <Switch
        checked={value}
        onChange={() => onChange(settingKey)}
        sx={{
          '& .MuiSwitch-switchBase.Mui-checked': { color: danger ? C.error : C.primary },
          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
            backgroundColor: danger ? C.error : C.primary,
          },
        }}
      />
    </Box>
  );
}

export default function SettingsTab({ settings, handleSosToggle, setAlertDialog }) {
  const boolVal = (k) => settings[k] === 'true';

  const coreKeys = ['pause_new_interviews', 'pause_new_signups', 'maintenance_mode', 'system_alert_message'];
  const extraEntries = Object.entries(settings).filter(([k]) => !coreKeys.includes(k));

  return (
    <Grid container spacing={3}>
      {/* SOS Controls */}
      <Grid item xs={12} md={6}>
        <Card sx={{
          ...glassCardStatic, p: 3,
          border: `1px solid ${alpha(C.error, 0.25)}`,
          background: alpha(C.error, 0.02),
        }}>
          <Typography sx={{ ...sectionTitle, color: C.error }}>
            <WarningIcon sx={{ color: C.error }} /> SOS Controls
          </Typography>
          <Typography sx={{ fontSize: '.82rem', color: C.textDim, mb: 2 }}>
            Emergency controls. Use with caution.
          </Typography>

          <SosToggle
            label="Pause New Interviews"
            settingKey="pause_new_interviews"
            danger
            icon={<PauseCircleIcon sx={{ color: C.warning }} />}
            value={boolVal('pause_new_interviews')}
            onChange={handleSosToggle}
          />
          <SosToggle
            label="Pause New Signups"
            settingKey="pause_new_signups"
            danger
            icon={<BlockIcon sx={{ color: C.error }} />}
            value={boolVal('pause_new_signups')}
            onChange={handleSosToggle}
          />
          <SosToggle
            label="Maintenance Mode"
            settingKey="maintenance_mode"
            danger
            icon={<BuildIcon sx={{ color: C.error }} />}
            value={boolVal('maintenance_mode')}
            onChange={handleSosToggle}
          />

          <Divider sx={{ my: 2, borderColor: alpha(C.error, 0.2) }} />

          <Button
            fullWidth variant="outlined"
            startIcon={<SendIcon />}
            onClick={() => setAlertDialog({ open: true, subject: 'System Alert — IntelliHire', message: '' })}
            sx={{
              borderColor: alpha(C.error, 0.4), color: C.error,
              fontWeight: 700, textTransform: 'none', py: 1.5, borderRadius: '10px',
              '&:hover': { borderColor: C.error, background: alpha(C.error, 0.08) },
            }}
          >
            Send System Alert Email
          </Button>
        </Card>
      </Grid>

      {/* System Info */}
      <Grid item xs={12} md={6}>
        <Card sx={{ ...glassCardStatic, p: 3 }}>
          <Typography sx={sectionTitle}>
            <SettingsIcon sx={{ color: C.primary }} /> System Info
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {extraEntries.map(([k, v]) => (
              <Box key={k} sx={{
                display: 'flex', justifyContent: 'space-between', p: 1.5,
                borderRadius: '8px', background: alpha(C.primary, 0.04),
              }}>
                <Typography sx={{ fontSize: '.85rem', color: C.textMuted, fontFamily: 'monospace' }}>{k}</Typography>
                <Typography sx={{ fontSize: '.85rem', color: C.text, fontWeight: 600 }}>{v}</Typography>
              </Box>
            ))}
            {extraEntries.length === 0 && (
              <Typography sx={{ color: C.textDim, fontSize: '.85rem', textAlign: 'center', py: 2 }}>
                Only core SOS settings configured.
              </Typography>
            )}
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
}
