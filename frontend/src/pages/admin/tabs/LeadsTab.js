import React from 'react';
import {
  Box, Typography, Button, IconButton, Chip, Tooltip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';

import {
  C, glassCardStatic, sectionTitle,
  tableHeaderCell, tableBodyCell, statusChip, statusColor,
} from '../constants';

export default function LeadsTab({
  leads, loadLeads, setLeadDetailDialog, setConfirmDialog, handleUpdateLeadStatus,
}) {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography sx={{ ...sectionTitle, mb: 0 }}>
          <LeaderboardIcon sx={{ color: C.primary }} /> All Leads ({leads.length})
        </Typography>
        <Button onClick={loadLeads} startIcon={<RefreshIcon />} sx={{ color: C.textMuted, textTransform: 'none' }}>
          Refresh
        </Button>
      </Box>

      <Box sx={{ ...glassCardStatic, overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Name', 'Company', 'Email', 'Phone', 'Plan', 'Status', 'Date', 'Actions'].map(h => (
                  <TableCell key={h} sx={tableHeaderCell}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {leads.map(l => (
                <TableRow key={l.id} sx={{ '&:hover': { background: alpha(C.primary, 0.04) } }}>
                  <TableCell sx={tableBodyCell}>{l.full_name}</TableCell>
                  <TableCell sx={tableBodyCell}>{l.company_name}</TableCell>
                  <TableCell sx={{ ...tableBodyCell, fontSize: '.82rem' }}>{l.work_email}</TableCell>
                  <TableCell sx={{ ...tableBodyCell, fontSize: '.82rem' }}>{l.phone}</TableCell>
                  <TableCell sx={tableBodyCell}>
                    <Chip label={l.selected_plan} size="small" sx={statusChip(statusColor(l.selected_plan))} />
                  </TableCell>
                  <TableCell sx={tableBodyCell}>
                    <Chip label={l.status} size="small" sx={statusChip(statusColor(l.status))} />
                  </TableCell>
                  <TableCell sx={{ ...tableBodyCell, color: C.textDim, fontSize: '.82rem' }}>
                    {new Date(l.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell sx={tableBodyCell}>
                    <Box sx={{ display: 'flex', gap: .5 }}>
                      <Tooltip title="View">
                        <IconButton size="small" sx={{ color: C.primary }}
                          onClick={() => setLeadDetailDialog({ open: true, lead: l })}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {l.status === 'new' && (
                        <Tooltip title="Mark Contacted">
                          <IconButton size="small" sx={{ color: C.warning }}
                            onClick={() => handleUpdateLeadStatus(l.id, 'contacted')}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {(l.status === 'new' || l.status === 'contacted') && (
                        <Tooltip title="Confirm">
                          <IconButton size="small" sx={{ color: C.success }}
                            onClick={() => setConfirmDialog({ open: true, lead: l, quota: 50, subscription_months: 12 })}>
                            <CheckCircleIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {l.status !== 'converted' && l.status !== 'lost' && (
                        <Tooltip title="Lost">
                          <IconButton size="small" sx={{ color: C.error }}
                            onClick={() => handleUpdateLeadStatus(l.id, 'lost')}>
                            <BlockIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {leads.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} sx={{ ...tableBodyCell, textAlign: 'center', py: 6, color: C.textDim }}>
                    No leads yet.
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
