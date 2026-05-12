import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import WarningIcon from '@mui/icons-material/Warning';
import { C, dialogSx, inputSx, primaryBtn } from '../constants';

export default function AlertEmailDialog({ alertDialog, setAlertDialog, handleSendAlertEmail }) {
  const reset = () => setAlertDialog({ open: false, subject: 'System Alert — IntelliHire', message: '' });

  return (
    <Dialog
      open={alertDialog.open}
      onClose={reset}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { ...dialogSx, border: `1px solid ${alpha(C.error, 0.3)}` } }}
    >
      <DialogTitle sx={{ fontWeight: 700, color: C.error }}>
        <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Send Alert to All Clients
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth label="Subject"
            value={alertDialog.subject}
            onChange={(e) => setAlertDialog({ ...alertDialog, subject: e.target.value })}
            sx={inputSx}
          />
          <TextField
            fullWidth multiline rows={5} label="Message"
            value={alertDialog.message}
            onChange={(e) => setAlertDialog({ ...alertDialog, message: e.target.value })}
            sx={inputSx}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={reset} sx={{ color: C.textMuted }}>Cancel</Button>
        <Button
          onClick={handleSendAlertEmail}
          sx={{ ...primaryBtn, background: `linear-gradient(135deg, ${C.error}, #f97316)` }}
        >
          Send to All
        </Button>
      </DialogActions>
    </Dialog>
  );
}
