import React from 'react';
import {
  Box, Typography, Button, IconButton, Chip, LinearProgress, Tooltip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import PeopleIcon from '@mui/icons-material/People';
import AddIcon from '@mui/icons-material/Add';

import {
  C, glassCardStatic, primaryBtn, sectionTitle,
  tableHeaderCell, tableBodyCell, statusChip, statusColor,
} from '../constants';

export default function ClientsTab({
  clients, loadClients, setCreateClientDialog, setQuotaDialog,
}) {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography sx={{ ...sectionTitle, mb: 0 }}>
          <PeopleIcon sx={{ color: C.primary }} /> Active Clients ({clients.length})
        </Typography>
        <Button
          sx={primaryBtn}
          startIcon={<AddIcon />}
          onClick={() => setCreateClientDialog({
            open: true, company_name: '', contact_name: '', email: '',
            plan: 'starter', quota: 50, password: '', subscription_months: 12,
          })}
        >
          Add Client
        </Button>
      </Box>

      <Box sx={{ ...glassCardStatic, overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Company', 'Contact', 'Tier', 'Quota', 'Used', 'Remaining', 'Status', 'Actions'].map(h => (
                  <TableCell key={h} sx={tableHeaderCell}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.map(c => {
                const rem = c.interview_quota - c.interviews_used;
                const pct = c.interview_quota > 0 ? (c.interviews_used / c.interview_quota) * 100 : 0;
                return (
                  <TableRow key={c.id} sx={{ '&:hover': { background: alpha(C.primary, 0.04) } }}>
                    <TableCell sx={tableBodyCell}>
                      <Typography sx={{ fontWeight: 700, fontSize: '.9rem' }}>{c.company_name}</Typography>
                      <Typography sx={{ fontSize: '.75rem', color: C.textDim }}>{c.user_email}</Typography>
                    </TableCell>
                    <TableCell sx={tableBodyCell}>{c.user_name || '—'}</TableCell>
                    <TableCell sx={tableBodyCell}>
                      <Chip label={c.tier} size="small" sx={statusChip(statusColor(c.tier))} />
                    </TableCell>
                    <TableCell sx={tableBodyCell}>{c.interview_quota}</TableCell>
                    <TableCell sx={tableBodyCell}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontSize: '.85rem' }}>{c.interviews_used}</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(pct, 100)}
                          sx={{
                            width: 60, height: 6, borderRadius: 3,
                            background: alpha(C.textDim, 0.2),
                            '& .MuiLinearProgress-bar': {
                              background: pct > 90 ? C.error : pct > 70 ? C.warning : C.success,
                              borderRadius: 3,
                            },
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell sx={{ ...tableBodyCell, fontWeight: 700, color: rem <= 5 ? C.error : C.success }}>
                      {rem}
                    </TableCell>
                    <TableCell sx={tableBodyCell}>
                      <Chip label={c.is_active ? 'Active' : 'Inactive'} size="small"
                        sx={statusChip(c.is_active ? C.success : C.error)} />
                    </TableCell>
                    <TableCell sx={tableBodyCell}>
                      <Tooltip title="Add Quota">
                        <IconButton size="small" sx={{ color: C.primary }}
                          onClick={() => setQuotaDialog({ open: true, client: c, addQuota: 10 })}>
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
              {clients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} sx={{ ...tableBodyCell, textAlign: 'center', py: 6, color: C.textDim }}>
                    No clients yet. Confirm a lead first.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}
