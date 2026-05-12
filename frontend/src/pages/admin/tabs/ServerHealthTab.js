import React from 'react';
import {
  Box, Typography, Card, Grid, Chip, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import DnsIcon from '@mui/icons-material/Dns';
import SpeedIcon from '@mui/icons-material/Speed';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

import {
  C, glassCardStatic, sectionTitle,
  tableHeaderCell, tableBodyCell, statusChip, fmtBytes, fmtUptime,
} from '../constants';

function GaugeCircle({ value, label, color }) {
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress
          variant="determinate" value={value} size={100} thickness={6}
          sx={{
            color,
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
              filter: `drop-shadow(0 0 8px ${alpha(color, 0.4)})`,
            },
          }}
        />
        <CircularProgress
          variant="determinate" value={100} size={100} thickness={6}
          sx={{ color: alpha(color, 0.12), position: 'absolute', left: 0 }}
        />
        <Box sx={{
          top: 0, left: 0, bottom: 0, right: 0, position: 'absolute',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: C.text }}>
            {Math.round(value)}%
          </Typography>
        </Box>
      </Box>
      <Typography sx={{ mt: 1, fontSize: '.82rem', color: C.textMuted, fontWeight: 600 }}>{label}</Typography>
    </Box>
  );
}

export default function ServerHealthTab({ health }) {
  if (!health) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress sx={{ color: C.primary }} />
      </Box>
    );
  }

  const sv = health.server;
  const as = health.active_sessions;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography sx={{ ...sectionTitle, mb: 0 }}>
          <DnsIcon sx={{ color: C.primary }} /> Server Metrics
          <Chip
            label="Live" size="small"
            sx={{ ml: 1, ...statusChip(C.success) }}
            icon={<FiberManualRecordIcon sx={{ fontSize: 10, color: `${C.success} !important` }} />}
          />
        </Typography>
        <Typography sx={{ color: C.textDim, fontSize: '.8rem' }}>Auto-refreshing every 30s</Typography>
      </Box>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Gauges */}
        <Grid item xs={12} md={5}>
          <Card sx={{ ...glassCardStatic, p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
              <GaugeCircle
                value={sv.cpu_percent} label="CPU"
                color={sv.cpu_percent > 80 ? C.error : sv.cpu_percent > 50 ? C.warning : C.success}
              />
              <GaugeCircle
                value={sv.ram_percent} label="RAM"
                color={sv.ram_percent > 85 ? C.error : sv.ram_percent > 60 ? C.warning : C.primary}
              />
              <GaugeCircle
                value={sv.disk_percent} label="Disk"
                color={sv.disk_percent > 90 ? C.error : sv.disk_percent > 70 ? C.warning : C.accent}
              />
            </Box>
            <Box sx={{ mt: 2.5, display: 'flex', justifyContent: 'space-around' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontSize: '.72rem', color: C.textDim }}>RAM</Typography>
                <Typography sx={{ fontSize: '.82rem', color: C.text, fontWeight: 600 }}>
                  {fmtBytes(sv.ram_used)} / {fmtBytes(sv.ram_total)}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontSize: '.72rem', color: C.textDim }}>Disk</Typography>
                <Typography sx={{ fontSize: '.82rem', color: C.text, fontWeight: 600 }}>
                  {fmtBytes(sv.disk_used)} / {fmtBytes(sv.disk_total)}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontSize: '.72rem', color: C.textDim }}>Uptime</Typography>
                <Typography sx={{ fontSize: '.82rem', color: C.text, fontWeight: 600 }}>
                  {fmtUptime(sv.uptime_seconds)}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Active Sessions */}
        <Grid item xs={12} md={7}>
          <Card sx={{ ...glassCardStatic, p: 3, height: '100%' }}>
            <Typography sx={sectionTitle}>
              <SpeedIcon sx={{ color: C.accent }} /> Active Sessions
              <Chip label={as.count} size="small" sx={{ ml: 1, ...statusChip(C.success) }} />
            </Typography>
            {as.sessions.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {['ID', 'Started', 'Client'].map(h => (
                        <TableCell key={h} sx={tableHeaderCell}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {as.sessions.map(s => (
                      <TableRow key={s.interview_id}>
                        <TableCell sx={tableBodyCell}>#{s.interview_id}</TableCell>
                        <TableCell sx={{ ...tableBodyCell, fontSize: '.82rem' }}>
                          {s.started_at ? new Date(s.started_at).toLocaleString() : '—'}
                        </TableCell>
                        <TableCell sx={tableBodyCell}>{s.client_name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ py: 4, textAlign: 'center', color: C.textDim }}>
                No active sessions right now.
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
