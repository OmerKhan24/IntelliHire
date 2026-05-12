import React from 'react';
import {
  Box, Typography, Card, CardContent, Grid, CircularProgress,
  Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SpeedIcon from '@mui/icons-material/Speed';
import BusinessIcon from '@mui/icons-material/Business';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

import {
  C, glassCard, glassCardStatic, sectionTitle,
  tableHeaderCell, tableBodyCell, statusChip, statusColor,
} from '../constants';

export default function DashboardTab({ dashboard, setLeadDetailDialog }) {
  if (!dashboard) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress sx={{ color: C.primary }} />
      </Box>
    );
  }

  const s = dashboard.stats;
  const cards = [
    { label: 'New Leads',       value: s.new_leads,                         icon: <LeaderboardIcon />,       color: C.primary   },
    { label: 'Total Clients',   value: s.total_clients,                     icon: <PeopleIcon />,            color: '#8b5cf6'   },
    { label: 'Active Clients',  value: s.active_clients,                    icon: <BusinessIcon />,          color: C.success   },
    { label: 'Net Revenue',     value: `$${s.net_revenue?.toLocaleString()}`, icon: <AttachMoneyIcon />,     color: '#f59e0b'   },
    { label: 'Total Interviews',value: s.total_interviews,                  icon: <SpeedIcon />,             color: '#ec4899'   },
    { label: 'Active Now',      value: s.active_interviews,                 icon: <FiberManualRecordIcon />, color: C.success   },
  ];

  return (
    <Box>
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {cards.map((c, i) => (
          <Grid item xs={6} sm={4} md={2} key={i}>
            <Card sx={{ ...glassCard, p: 0, overflow: 'visible' }}>
              <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{
                    width: 42, height: 42, borderRadius: '12px',
                    background: alpha(c.color, 0.15),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {React.cloneElement(c.icon, { sx: { color: c.color, fontSize: 22 } })}
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: C.text, lineHeight: 1 }}>
                      {c.value}
                    </Typography>
                    <Typography sx={{ fontSize: '.72rem', color: C.textMuted, fontWeight: 600, mt: .3 }}>
                      {c.label}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ ...glassCardStatic, p: 3 }}>
        <Typography sx={sectionTitle}>
          <LeaderboardIcon sx={{ color: C.primary }} /> Recent Leads
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Name', 'Company', 'Email', 'Plan', 'Status', 'Date'].map(h => (
                  <TableCell key={h} sx={tableHeaderCell}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {(dashboard.recent_leads || []).map(l => (
                <TableRow
                  key={l.id}
                  sx={{ '&:hover': { background: alpha(C.primary, 0.04) }, cursor: 'pointer' }}
                  onClick={() => setLeadDetailDialog({ open: true, lead: l })}
                >
                  <TableCell sx={tableBodyCell}>{l.full_name}</TableCell>
                  <TableCell sx={tableBodyCell}>{l.company_name}</TableCell>
                  <TableCell sx={tableBodyCell}>{l.work_email}</TableCell>
                  <TableCell sx={tableBodyCell}>
                    <Chip label={l.selected_plan} size="small" sx={statusChip(statusColor(l.selected_plan))} />
                  </TableCell>
                  <TableCell sx={tableBodyCell}>
                    <Chip label={l.status} size="small" sx={statusChip(statusColor(l.status))} />
                  </TableCell>
                  <TableCell sx={{ ...tableBodyCell, color: C.textDim, fontSize: '.82rem' }}>
                    {new Date(l.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}
