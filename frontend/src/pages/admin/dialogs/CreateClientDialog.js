import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, MenuItem,
} from '@mui/material';
import { C, dialogSx, inputSx, primaryBtn } from '../constants';

export default function CreateClientDialog({ createClientDialog, setCreateClientDialog, handleCreateClient, loading }) {
  const reset = () => setCreateClientDialog(p => ({ ...p, open: false }));

  return (
    <Dialog open={createClientDialog.open} onClose={reset} maxWidth="sm" fullWidth PaperProps={{ sx: dialogSx }}>
      <DialogTitle sx={{ fontWeight: 700 }}>Add Client Manually</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth label="Company Name"
            value={createClientDialog.company_name}
            onChange={(e) => setCreateClientDialog({ ...createClientDialog, company_name: e.target.value })}
            sx={inputSx}
          />
          <TextField
            fullWidth label="Contact Name"
            value={createClientDialog.contact_name}
            onChange={(e) => setCreateClientDialog({ ...createClientDialog, contact_name: e.target.value })}
            sx={inputSx}
          />
          <TextField
            fullWidth label="Email" type="email"
            value={createClientDialog.email}
            onChange={(e) => setCreateClientDialog({ ...createClientDialog, email: e.target.value })}
            sx={inputSx}
          />
          <TextField
            fullWidth label="Temporary Password (optional)" type="password"
            value={createClientDialog.password}
            onChange={(e) => setCreateClientDialog({ ...createClientDialog, password: e.target.value })}
            sx={inputSx}
            helperText="Leave empty for auto-generated"
            FormHelperTextProps={{ sx: { color: C.textDim } }}
          />
          <TextField
            fullWidth select label="Plan"
            value={createClientDialog.plan}
            onChange={(e) => setCreateClientDialog({ ...createClientDialog, plan: e.target.value })}
            sx={inputSx}
            SelectProps={{ MenuProps: { PaperProps: { sx: { bgcolor: '#1a2332', color: C.text } } } }}
          >
            <MenuItem value="starter">Starter</MenuItem>
            <MenuItem value="professional">Professional</MenuItem>
            <MenuItem value="enterprise">Enterprise</MenuItem>
          </TextField>
          <TextField
            fullWidth label="Interview Quota" type="number"
            value={createClientDialog.quota}
            onChange={(e) => setCreateClientDialog({ ...createClientDialog, quota: parseInt(e.target.value) || 0 })}
            sx={inputSx}
          />
          <TextField
            fullWidth select label="Subscription Duration"
            value={createClientDialog.subscription_months}
            onChange={(e) => setCreateClientDialog({ ...createClientDialog, subscription_months: parseInt(e.target.value) })}
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
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={reset} sx={{ color: C.textMuted }}>Cancel</Button>
        <Button
          onClick={handleCreateClient}
          disabled={loading || !createClientDialog.company_name || !createClientDialog.email}
          sx={primaryBtn}
        >
          {loading ? 'Creating...' : 'Create Client'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
