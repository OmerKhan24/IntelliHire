import React from 'react';
import {
  Box, Typography, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import HistoryIcon from '@mui/icons-material/History';

import { C, glassCardStatic, sectionTitle, tableHeaderCell, tableBodyCell } from '../constants';

export default function AuditLogsTab({ auditLogs, auditTotal, auditPage, loadAuditLogs }) {
  return (
    <Box>
      <Typography sx={sectionTitle}>
        <HistoryIcon sx={{ color: C.primary }} /> Audit Logs ({auditTotal})
      </Typography>

      <Box sx={{ ...glassCardStatic, overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 500 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {['User', 'Action', 'Entity', 'IP', 'Time'].map(h => (
                  <TableCell key={h} sx={{ ...tableHeaderCell, background: C.bgCard }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {auditLogs.map(l => (
                <TableRow key={l.id} sx={{ '&:hover': { background: alpha(C.primary, 0.04) } }}>
                  <TableCell sx={tableBodyCell}>{l.user_name || `User #${l.user_id}`}</TableCell>
                  <TableCell sx={tableBodyCell}>
                    <Chip
                      label={l.action} size="small"
                      sx={{ background: alpha(C.primary, 0.12), color: C.primary, fontWeight: 600, fontSize: '.72rem' }}
                    />
                  </TableCell>
                  <TableCell sx={{ ...tableBodyCell, fontSize: '.82rem', color: C.textDim }}>
                    {l.entity_type ? `${l.entity_type} #${l.entity_id || ''}` : '—'}
                  </TableCell>
                  <TableCell sx={{ ...tableBodyCell, fontFamily: 'monospace', fontSize: '.78rem', color: C.textDim }}>
                    {l.ip_address || '—'}
                  </TableCell>
                  <TableCell sx={{ ...tableBodyCell, fontSize: '.78rem', color: C.textDim }}>
                    {new Date(l.created_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {auditTotal > 30 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, py: 2 }}>
            <Button
              disabled={auditPage <= 1}
              onClick={() => loadAuditLogs(auditPage - 1)}
              sx={{ color: C.textMuted, textTransform: 'none' }}
            >
              Prev
            </Button>
            <Typography sx={{ color: C.textDim, alignSelf: 'center', fontSize: '.85rem' }}>
              Page {auditPage}
            </Typography>
            <Button onClick={() => loadAuditLogs(auditPage + 1)} sx={{ color: C.textMuted, textTransform: 'none' }}>
              Next
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
