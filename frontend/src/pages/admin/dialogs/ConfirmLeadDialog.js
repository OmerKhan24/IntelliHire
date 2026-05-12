import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, Typography, MenuItem,
} from '@mui/material';
import { C, dialogSx, inputSx, primaryBtn } from '../constants';

export default function ConfirmLeadDialog({ confirmDialog, setConfirmDialog, handleConfirmLead, loading }) {
  const reset = () => setConfirmDialog({ open: false, lead: null, quota: 50, subscription_months: 12 });

  return (
    <Dialog open={confirmDialog.open} onClose={reset} maxWidth="sm" fullWidth PaperProps={{ sx: dialogSx }}>
      <DialogTitle sx={{ fontWeight: 700 }}>Confirm Lead & Generate Credentials</DialogTitle>
      <DialogContent>
        {confirmDialog.lead && (
          <Box sx={{ mt: 1 }}>
            <Typography sx={{ mb: 2, color: C.textMuted }}>
              Create login for <strong style={{ color: C.text }}>{confirmDialog.lead.full_name}</strong> at{' '}
              <strong style={{ color: C.text }}>{confirmDialog.lead.company_name}</strong>.
            </Typography>
            <TextField
              fullWidth label="Plan/Tier"
              value={confirmDialog.lead?.selected_plan || ''} disabled
              sx={{ mb: 2, ...inputSx }}
            />
            <TextField
              fullWidth label="Interview Quota" type="number"
              value={confirmDialog.quota || 50}
              onChange={(e) => setConfirmDialog({ ...confirmDialog, quota: parseInt(e.target.value) })}
              sx={{ mb: 2, ...inputSx }}
            />
            <TextField
              fullWidth select label="Subscription Duration"
              value={confirmDialog.subscription_months || 12}
              onChange={(e) => setConfirmDialog({ ...confirmDialog, subscription_months: parseInt(e.target.value) })}
              sx={inputSx}
              SelectProps={{ MenuProps: { PaperProps: { sx: { bgcolor: '#1a2332', color: C.text } } } }}
            >
              <MenuItem value={1}>1 Month</MenuItem>
              <MenuItem value={3}>3 Months</MenuItem>
              <MenuItem value={6}>6 Months</MenuItem>
              <MenuItem value={12}>12 Months</MenuItem>
              <MenuItem value={24}>24 Months</MenuItem>
            </TextField>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={reset} sx={{ color: C.textMuted }}>Cancel</Button>
        <Button onClick={handleConfirmLead} disabled={loading} sx={primaryBtn}>
          {loading ? 'Processing...' : 'Confirm & Send Credentials'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
