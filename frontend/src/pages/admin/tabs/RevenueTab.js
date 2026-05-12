import React from 'react';
import {
  Box, Typography, Button, Card, CardContent, Grid, IconButton, Chip, Tooltip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AddIcon from '@mui/icons-material/Add';

import {
  C, glassCard, glassCardStatic, primaryBtn, sectionTitle,
  tableHeaderCell, tableBodyCell, statusChip, statusColor,
} from '../constants';

export default function RevenueTab({
  payments, refunds, totalRevenue, loadRevenue, setPaymentDialog, setRefundDialog, clients,
}) {
  const totalRefunded = refunds
    .filter(r => r.status === 'processed')
    .reduce((s, r) => s + r.amount, 0);

  const summaryCards = [
    { label: 'Total Collected', value: `$${totalRevenue.toLocaleString()}`,              color: C.success, icon: <AttachMoneyIcon /> },
    { label: 'Total Refunded',  value: `$${totalRefunded.toLocaleString()}`,             color: C.error,   icon: <ReceiptLongIcon /> },
    { label: 'Net Revenue',     value: `$${(totalRevenue - totalRefunded).toLocaleString()}`, color: C.primary, icon: <TrendingUpIcon /> },
  ];

  return (
    <Box>
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {summaryCards.map((c, i) => (
          <Grid item xs={12} sm={4} key={i}>
            <Card sx={{ ...glassCard, p: 0 }}>
              <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, '&:last-child': { pb: 3 } }}>
                <Box sx={{
                  width: 48, height: 48, borderRadius: '14px',
                  background: alpha(c.color, 0.15),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {React.cloneElement(c.icon, { sx: { color: c.color, fontSize: 26 } })}
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: C.text }}>{c.value}</Typography>
                  <Typography sx={{ fontSize: '.78rem', color: C.textMuted, fontWeight: 600 }}>{c.label}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>
        {/* Payments */}
        <Grid item xs={12} md={7}>
          <Box sx={{ ...glassCardStatic, p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography sx={{ ...sectionTitle, mb: 0 }}>
                <AttachMoneyIcon sx={{ color: C.success }} /> Payments
              </Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                sx={primaryBtn}
                onClick={() => setPaymentDialog(p => ({ ...p, open: true }))}
              >
                Record Payment
              </Button>
            </Box>
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {['Client', 'Amount', 'Method', 'Status', 'Date', 'Actions'].map(h => (
                      <TableCell key={h} sx={{ ...tableHeaderCell, background: C.bgCard }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map(p => (
                    <TableRow key={p.id}>
                      <TableCell sx={tableBodyCell}>{p.client_name}</TableCell>
                      <TableCell sx={{ ...tableBodyCell, fontWeight: 700 }}>${p.amount}</TableCell>
                      <TableCell sx={tableBodyCell}>{p.payment_method}</TableCell>
                      <TableCell sx={tableBodyCell}>
                        <Chip label={p.status} size="small" sx={statusChip(statusColor(p.status))} />
                      </TableCell>
                      <TableCell sx={{ ...tableBodyCell, fontSize: '.82rem', color: C.textDim }}>
                        {p.paid_at ? new Date(p.paid_at).toLocaleDateString() : '—'}
                      </TableCell>
                      <TableCell sx={tableBodyCell}>
                        {p.status === 'completed' && (
                          <Tooltip title="Refund">
                            <IconButton size="small" sx={{ color: C.warning }}
                              onClick={() => setRefundDialog({ open: true, paymentId: p.id, amount: p.amount, reason: '' })}>
                              <ReceiptLongIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Grid>

        {/* Refunds */}
        <Grid item xs={12} md={5}>
          <Box sx={{ ...glassCardStatic, p: 3 }}>
            <Typography sx={sectionTitle}>
              <ReceiptLongIcon sx={{ color: C.error }} /> Refunds
            </Typography>
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {['Client', 'Amount', 'Reason', 'Status', 'Date'].map(h => (
                      <TableCell key={h} sx={{ ...tableHeaderCell, background: C.bgCard }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {refunds.map(r => (
                    <TableRow key={r.id}>
                      <TableCell sx={tableBodyCell}>{r.client_name}</TableCell>
                      <TableCell sx={{ ...tableBodyCell, fontWeight: 700, color: C.error }}>${r.amount}</TableCell>
                      <TableCell sx={{
                        ...tableBodyCell, fontSize: '.82rem',
                        maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {r.reason}
                      </TableCell>
                      <TableCell sx={tableBodyCell}>
                        <Chip label={r.status} size="small" sx={statusChip(statusColor(r.status))} />
                      </TableCell>
                      <TableCell sx={{ ...tableBodyCell, fontSize: '.82rem', color: C.textDim }}>
                        {new Date(r.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {refunds.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ ...tableBodyCell, textAlign: 'center', py: 4, color: C.textDim }}>
                        No refunds
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
