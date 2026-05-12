import React from 'react';
import { Box, Typography, Button, Card, CardContent, Grid, Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ApiIcon from '@mui/icons-material/Api';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';

import { C, glassCard, sectionTitle, statusChip } from '../constants';

export default function ApiStatusTab({ apiStatusData, loadApiStatus }) {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography sx={{ ...sectionTitle, mb: 0 }}>
          <ApiIcon sx={{ color: C.primary }} /> Third-Party APIs
        </Typography>
        <Button onClick={loadApiStatus} startIcon={<RefreshIcon />} sx={{ color: C.textMuted, textTransform: 'none' }}>
          Re-check
        </Button>
      </Box>

      <Grid container spacing={2.5}>
        {apiStatusData.map((a, i) => {
          const isOp = a.status === 'operational';
          const isDeg = a.status === 'degraded';
          const color = isOp ? C.success : isDeg ? C.warning : C.error;
          const Icon = isOp ? CheckCircleIcon : isDeg ? WarningIcon : ErrorIcon;
          return (
            <Grid item xs={12} sm={4} key={i}>
              <Card sx={{ ...glassCard, p: 0, borderColor: alpha(color, 0.3) }}>
                <CardContent sx={{ p: 3, textAlign: 'center', '&:last-child': { pb: 3 } }}>
                  <Icon sx={{
                    fontSize: 40, color, mb: 1,
                    filter: `drop-shadow(0 0 10px ${alpha(color, 0.4)})`,
                  }} />
                  <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: C.text, mb: .5 }}>
                    {a.name}
                  </Typography>
                  <Chip label={a.status} size="small" sx={{ ...statusChip(color), mb: 1.5 }} />
                  {a.response_time_ms != null && (
                    <Typography sx={{ fontSize: '.78rem', color: C.textDim }}>
                      Response: {a.response_time_ms}ms
                    </Typography>
                  )}
                  <Typography sx={{ fontSize: '.72rem', color: C.textDim, mt: .5 }}>
                    Checked: {a.last_checked ? new Date(a.last_checked).toLocaleTimeString() : '—'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
