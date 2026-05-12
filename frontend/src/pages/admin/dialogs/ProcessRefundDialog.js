import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { C, dialogSx, inputSx, primaryBtn } from '../constants';

export default function ProcessRefundDialog({ refundDialog, setRefundDialog, handleProcessRefund }) {
  const reset = () => setRefundDialog({ open: false, paymentId: '', amount: '', reason: '' });

  return (
    <Dialog open={refundDialog.open} onClose={reset} maxWidth="sm" fullWidth PaperProps={{ sx: dialogSx }}>
      <DialogTitle sx={{ fontWeight: 700 }}>Process Refund</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth label="Refund Amount ($)" type="number"
            value={refundDialog.amount}
            onChange={(e) => setRefundDialog({ ...refundDialog, amount: e.target.value })}
            sx={inputSx}
          />
          <TextField
            fullWidth multiline rows={3} label="Reason"
            value={refundDialog.reason}
            onChange={(e) => setRefundDialog({ ...refundDialog, reason: e.target.value })}
            sx={inputSx}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={reset} sx={{ color: C.textMuted }}>Cancel</Button>
        <Button
          onClick={handleProcessRefund}
          sx={{ ...primaryBtn, background: `linear-gradient(135deg, ${C.error}, #f97316)` }}
        >
          Process Refund
        </Button>
      </DialogActions>
    </Dialog>
  );
}
