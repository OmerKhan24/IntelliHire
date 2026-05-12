import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import { C, dialogSx, inputSx, primaryBtn } from '../constants';

export default function RecordPaymentDialog({ paymentDialog, setPaymentDialog, handleRecordPayment, clients }) {
  const reset = () => setPaymentDialog({ open: false, clientId: '', amount: '', method: 'manual', ref: '', desc: '' });

  return (
    <Dialog open={paymentDialog.open} onClose={reset} maxWidth="sm" fullWidth PaperProps={{ sx: dialogSx }}>
      <DialogTitle sx={{ fontWeight: 700 }}>Record Payment</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: C.textMuted }}>Client</InputLabel>
            <Select
              value={paymentDialog.clientId}
              onChange={(e) => setPaymentDialog({ ...paymentDialog, clientId: e.target.value })}
              sx={{ color: C.text }}
            >
              {clients.map(c => <MenuItem key={c.id} value={c.id}>{c.company_name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField
            fullWidth label="Amount ($)" type="number"
            value={paymentDialog.amount}
            onChange={(e) => setPaymentDialog({ ...paymentDialog, amount: e.target.value })}
            sx={inputSx}
          />
          <TextField
            fullWidth label="Payment Reference"
            value={paymentDialog.ref}
            onChange={(e) => setPaymentDialog({ ...paymentDialog, ref: e.target.value })}
            sx={inputSx}
          />
          <TextField
            fullWidth label="Description"
            value={paymentDialog.desc}
            onChange={(e) => setPaymentDialog({ ...paymentDialog, desc: e.target.value })}
            sx={inputSx}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={reset} sx={{ color: C.textMuted }}>Cancel</Button>
        <Button onClick={handleRecordPayment} sx={primaryBtn}>Record</Button>
      </DialogActions>
    </Dialog>
  );
}
