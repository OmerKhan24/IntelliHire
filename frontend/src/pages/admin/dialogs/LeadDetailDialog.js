import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography,
} from '@mui/material';
import { C, dialogSx } from '../constants';

export default function LeadDetailDialog({ leadDetailDialog, setLeadDetailDialog }) {
  const reset = () => setLeadDetailDialog({ open: false, lead: null });

  return (
    <Dialog open={leadDetailDialog.open} onClose={reset} maxWidth="sm" fullWidth PaperProps={{ sx: dialogSx }}>
      <DialogTitle sx={{ fontWeight: 700 }}>Lead Details</DialogTitle>
      <DialogContent>
        {leadDetailDialog.lead && (() => {
          const l = leadDetailDialog.lead;
          const fields = [
            ['Full Name', l.full_name], ['Job Title', l.job_title], ['Company', l.company_name],
            ['Size', l.company_size], ['Industry', l.industry], ['Email', l.work_email],
            ['Phone', l.phone], ['Country', l.country], ['Plan', l.selected_plan],
            ['Status', l.status], ['Message', l.message],
          ];
          return (
            <Box sx={{ mt: 1 }}>
              {fields.map(([k, v]) => v && (
                <Box key={k} sx={{ display: 'flex', py: 1, borderBottom: `1px solid ${C.border}` }}>
                  <Typography sx={{ width: 120, fontSize: '.85rem', color: C.textDim, flexShrink: 0 }}>{k}</Typography>
                  <Typography sx={{ fontSize: '.85rem', color: C.text }}>{v}</Typography>
                </Box>
              ))}
            </Box>
          );
        })()}
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={reset} sx={{ color: C.textMuted }}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
