import React from 'react';
import { Alert, Box, Chip, Typography, LinearProgress } from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  PhoneAndroid as PhoneIcon,
  People as PeopleIcon,
  Visibility as VisibilityIcon,
  DirectionsRun as MovementIcon
} from '@mui/icons-material';

/**
 * Component to display CV monitoring warnings and status
 */
const MonitoringAlert = ({ warning, riskScore, riskLevel, onDismiss }) => {
  if (!warning && !riskScore) return null;
  
  // Get icon based on warning type
  const getWarningIcon = (type) => {
    if (type?.includes('phone')) return <PhoneIcon />;
    if (type?.includes('face') || type?.includes('multiple')) return <PeopleIcon />;
    if (type?.includes('gaze')) return <VisibilityIcon />;
    if (type?.includes('movement')) return <MovementIcon />;
    return <WarningIcon />;
  };
  
  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'info';
    }
  };
  
  // Get risk level color
  const getRiskColor = (level) => {
    switch (level) {
      case 'critical': return '#d32f2f';
      case 'high': return '#f57c00';
      case 'medium': return '#fbc02d';
      case 'low': return '#388e3c';
      default: return '#757575';
    }
  };
  
  return (
    <Box sx={{ mb: 2 }}>
      {/* Active Warning */}
      {warning && (
        <Alert
          severity={getSeverityColor(warning.severity)}
          icon={getWarningIcon(warning.type)}
          onClose={onDismiss}
          sx={{
            mb: 1,
            animation: 'pulse 1s ease-in-out',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 1 },
              '50%': { opacity: 0.8 }
            }
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            {warning.severity.toUpperCase()} ALERT
          </Typography>
          <Typography variant="body2">
            {warning.message}
          </Typography>
        </Alert>
      )}
      
      {/* Risk Score Display */}
      {riskScore !== undefined && (
        <Box 
          sx={{ 
            p: 2, 
            bgcolor: 'background.paper', 
            borderRadius: 1,
            border: 1,
            borderColor: getRiskColor(riskLevel),
            boxShadow: 1
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Interview Integrity Score
            </Typography>
            <Chip 
              label={riskLevel?.toUpperCase() || 'UNKNOWN'}
              size="small"
              sx={{ 
                bgcolor: getRiskColor(riskLevel),
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.65rem'
              }}
            />
          </Box>
          
          <LinearProgress 
            variant="determinate" 
            value={(1 - riskScore) * 100}
            sx={{
              height: 8,
              borderRadius: 1,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                bgcolor: getRiskColor(riskLevel),
                borderRadius: 1
              }
            }}
          />
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {riskLevel === 'low' ? 'No significant issues detected' :
             riskLevel === 'medium' ? 'Some concerns detected - please stay focused' :
             riskLevel === 'high' ? 'Multiple violations detected - interview may be flagged' :
             riskLevel === 'critical' ? 'Serious violations detected - interview will be reviewed' :
             'Monitoring active...'}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default MonitoringAlert;
