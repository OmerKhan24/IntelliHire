import React from 'react';
import {
  Box, Typography, Button, Card, CardContent, Grid, IconButton, Chip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CampaignIcon from '@mui/icons-material/Campaign';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import { C, glassCard, glassCardStatic, primaryBtn, sectionTitle, statusChip } from '../constants';

export default function AnnouncementsTab({
  announcements, setAnnouncementDialog, handleDeleteAnnouncement,
}) {
  const typeColors = {
    info: C.primary,
    warning: C.warning,
    maintenance: C.error,
    update: C.success,
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography sx={{ ...sectionTitle, mb: 0 }}>
          <CampaignIcon sx={{ color: C.primary }} /> Announcements
        </Typography>
        <Button
          startIcon={<AddIcon />}
          sx={primaryBtn}
          onClick={() => setAnnouncementDialog({ open: true, title: '', content: '', type: 'info' })}
        >
          New
        </Button>
      </Box>

      <Grid container spacing={2}>
        {announcements.map(a => {
          const color = typeColors[a.type] || C.primary;
          return (
            <Grid item xs={12} sm={6} key={a.id}>
              <Card sx={{ ...glassCard, borderLeft: `3px solid ${color}`, opacity: a.is_active ? 1 : 0.5 }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Chip label={a.type} size="small" sx={{ ...statusChip(color), mb: 1 }} />
                      <Typography sx={{ fontWeight: 700, color: C.text, mb: .5 }}>{a.title}</Typography>
                      <Typography sx={{ fontSize: '.85rem', color: C.textMuted, lineHeight: 1.6 }}>
                        {a.content}
                      </Typography>
                    </Box>
                    <IconButton size="small" sx={{ color: C.error }}
                      onClick={() => handleDeleteAnnouncement(a.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Typography sx={{ fontSize: '.72rem', color: C.textDim, mt: 1 }}>
                    By {a.creator_name} • {new Date(a.created_at).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
        {announcements.length === 0 && (
          <Grid item xs={12}>
            <Box sx={{ ...glassCardStatic, p: 4, textAlign: 'center', color: C.textDim }}>
              No announcements yet.
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
