// Example: How to integrate CV Monitoring into CandidateInterview.js

// ==================== ADD TO IMPORTS ====================
import { useCVMonitoring } from '../hooks/useCVMonitoring';
import MonitoringAlert from '../components/MonitoringAlert';

// ==================== ADD TO COMPONENT ====================
function CandidateInterview() {
  // ... existing state ...
  
  // ADD CV Monitoring hook
  const {
    monitoring,
    recentWarning,
    startMonitoring,
    stopMonitoring,
    getWarningStats,
    clearWarning
  } = useCVMonitoring(interview?.id, videoRef, true);
  
  // ... existing code ...
  
  // ==================== MODIFY START INTERVIEW ====================
  const handleStartInterview = async () => {
    try {
      // ... existing start logic ...
      
      // Start CV monitoring after interview starts
      if (interview?.id) {
        await startMonitoring();
        console.log('✅ CV monitoring started for interview', interview.id);
      }
      
    } catch (error) {
      console.error('Failed to start interview:', error);
    }
  };
  
  // ==================== MODIFY COMPLETE INTERVIEW ====================
  const handleCompleteInterview = async () => {
    try {
      setLoading(true);
      
      // Stop CV monitoring and get report
      console.log('🏁 Stopping CV monitoring...');
      const monitoringReport = await stopMonitoring();
      
      if (monitoringReport) {
        console.log('📊 Monitoring Report:', monitoringReport);
        console.log(`- Total Warnings: ${monitoringReport.total_warnings}`);
        console.log(`- Risk Level: ${monitoringReport.risk_level}`);
        console.log(`- Frames Analyzed: ${monitoringReport.total_frames_analyzed}`);
      }
      
      // ... existing completion logic ...
      const response = await api.interviews.complete(interview.id);
      
      // ... rest of completion code ...
      
    } catch (error) {
      console.error('Failed to complete interview:', error);
      setError('Failed to complete interview');
    } finally {
      setLoading(false);
    }
  };
  
  // ==================== ADD TO JSX RENDER ====================
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Existing header and loading states */}
      
      {step === 'interview' && (
        <>
          {/* ADD MONITORING ALERT AT TOP */}
          <MonitoringAlert
            warning={recentWarning}
            riskScore={monitoring.riskScore}
            riskLevel={monitoring.riskLevel}
            onDismiss={clearWarning}
          />
          
          {/* Video section */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ position: 'relative' }}>
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      style={{
                        width: '100%',
                        maxHeight: '400px',
                        borderRadius: '8px',
                        background: '#000'
                      }}
                    />
                    
                    {/* OPTIONAL: Add monitoring status badge */}
                    {monitoring.active && (
                      <Chip
                        label="Monitoring Active"
                        color="primary"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          animation: 'pulse 2s infinite'
                        }}
                      />
                    )}
                  </Box>
                  
                  {/* ... existing video controls ... */}
                </CardContent>
              </Card>
            </Grid>
            
            {/* ... rest of interview UI ... */}
          </Grid>
        </>
      )}
      
      {/* ... rest of component ... */}
    </Container>
  );
}

// ==================== OPTIONAL: ADD WARNING STATS PANEL ====================
// You can add this anywhere in the interview view:
{monitoring.active && (
  <Card sx={{ mt: 2, bgcolor: 'info.light' }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Interview Integrity Monitor
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6} sm={3}>
          <Box textAlign="center">
            <Typography variant="h4" color="primary">
              {monitoring.frameCount}
            </Typography>
            <Typography variant="caption">Frames Analyzed</Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Box textAlign="center">
            <Typography variant="h4" color="warning.main">
              {monitoring.warnings.length}
            </Typography>
            <Typography variant="caption">Warnings</Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Box textAlign="center">
            <Typography variant="h4" 
              sx={{ 
                color: monitoring.riskLevel === 'low' ? 'success.main' :
                       monitoring.riskLevel === 'medium' ? 'warning.main' :
                       'error.main'
              }}
            >
              {monitoring.riskLevel.toUpperCase()}
            </Typography>
            <Typography variant="caption">Risk Level</Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Box textAlign="center">
            <Typography variant="h4" color="text.secondary">
              {Math.round((1 - monitoring.riskScore) * 100)}%
            </Typography>
            <Typography variant="caption">Integrity Score</Typography>
          </Box>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
)}

// ==================== CLEANUP ON UNMOUNT ====================
// The hook already handles this, but you can add additional cleanup:
useEffect(() => {
  return () => {
    // Hook will automatically stop monitoring
    // Add any additional cleanup here
  };
}, []);

// ==================== EXAMPLE: CUSTOM WARNING HANDLER ====================
// If you want to do something special when warnings occur:
useEffect(() => {
  if (recentWarning) {
    console.warn('⚠️ CV Violation:', recentWarning);
    
    // Example: Play sound alert
    // const audio = new Audio('/alert.mp3');
    // audio.play().catch(e => console.error('Audio play failed:', e));
    
    // Example: Show custom notification
    // showNotification(recentWarning.message, recentWarning.severity);
    
    // Example: Track analytics
    // analytics.track('interview_violation', {
    //   type: recentWarning.type,
    //   severity: recentWarning.severity
    // });
  }
}, [recentWarning]);

// ==================== EXAMPLE: PERIODIC STATUS CHECK ====================
// Optional: Check monitoring status periodically
useEffect(() => {
  if (!monitoring.active || !interview?.id) return;
  
  const statusInterval = setInterval(async () => {
    const stats = getWarningStats();
    console.log('📊 Current stats:', stats);
    
    // You could update UI based on stats
    // or send to backend for real-time dashboard
  }, 10000); // Every 10 seconds
  
  return () => clearInterval(statusInterval);
}, [monitoring.active, interview?.id, getWarningStats]);

export default CandidateInterview;
