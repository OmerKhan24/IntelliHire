import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, Typography,
} from '@mui/material';
import { C, dialogSx, inputSx, primaryBtn } from '../constants';

export default function AddQuotaDialog({ quotaDialog, setQuotaDialog, handleUpdateQuota }) {
  const reset = () => setQuotaDialog({ open: false, client: null, addQuota: 10 });

  return (
    <Dialog open={quotaDialog.open} onClose={reset} maxWidth="xs" fullWidth PaperProps={{ sx: dialogSx }}>
      <DialogTitle sx={{ fontWeight: 700 }}>Add Interview Quota</DialogTitle>
      <DialogContent>
        {quotaDialog.client && (
          <Box sx={{ mt: 1 }}>
            <Typography sx={{ mb: 2, color: C.textMuted }}>
              {quotaDialog.client.company_name} — Quota: {quotaDialog.client.interview_quota}, Used: {quotaDialog.client.interviews_used}
            </Typography>
            <TextField
              fullWidth label="Add Interviews" type="number"
              value={quotaDialog.addQuota}
              onChange={(e) => setQuotaDialog({ ...quotaDialog, addQuota: e.target.value })}
              sx={inputSx}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={reset} sx={{ color: C.textMuted }}>Cancel</Button>
        <Button onClick={handleUpdateQuota} sx={primaryBtn}>Add Quota</Button>
      </DialogActions>
    </Dialog>
  );
}
