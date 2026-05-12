import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import { C, dialogSx, inputSx, primaryBtn } from '../constants';

export default function NewAnnouncementDialog({
  announcementDialog, setAnnouncementDialog, handleCreateAnnouncement,
}) {
  const reset = () => setAnnouncementDialog({ open: false, title: '', content: '', type: 'info' });

  return (
    <Dialog open={announcementDialog.open} onClose={reset} maxWidth="sm" fullWidth PaperProps={{ sx: dialogSx }}>
      <DialogTitle sx={{ fontWeight: 700 }}>New Announcement</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth label="Title"
            value={announcementDialog.title}
            onChange={(e) => setAnnouncementDialog({ ...announcementDialog, title: e.target.value })}
            sx={inputSx}
          />
          <TextField
            fullWidth multiline rows={4} label="Content"
            value={announcementDialog.content}
            onChange={(e) => setAnnouncementDialog({ ...announcementDialog, content: e.target.value })}
            sx={inputSx}
          />
          <FormControl fullWidth>
            <InputLabel sx={{ color: C.textMuted }}>Type</InputLabel>
            <Select
              value={announcementDialog.type}
              onChange={(e) => setAnnouncementDialog({ ...announcementDialog, type: e.target.value })}
              sx={{ color: C.text }}
            >
              <MenuItem value="info">Info</MenuItem>
              <MenuItem value="warning">Warning</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
              <MenuItem value="update">Update</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={reset} sx={{ color: C.textMuted }}>Cancel</Button>
        <Button onClick={handleCreateAnnouncement} sx={primaryBtn}>Publish</Button>
      </DialogActions>
    </Dialog>
  );
}
