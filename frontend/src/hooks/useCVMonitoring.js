import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../services/api';

/**
 * Custom hook for CV monitoring integration
 * Handles face detection, gaze tracking, and mobile detection
 */
export const useCVMonitoring = (interviewId, videoRef, enabled = true) => {
  const [monitoring, setMonitoring] = useState({
    active: false,
    warnings: [],
    detections: [],
    riskScore: 0,
    riskLevel: 'low',
    frameCount: 0
  });
  
  const [recentWarning, setRecentWarning] = useState(null);
  const monitoringIntervalRef = useRef(null);
  const canvasRef = useRef(null);
  const isActiveRef = useRef(false); // Track active state with ref for callbacks
  
  // Capture and analyze frame
  const captureAndAnalyzeFrame = useCallback(async () => {
    if (!videoRef?.current || !interviewId || !isActiveRef.current) {
      if (!videoRef?.current) console.log('❌ No videoRef');
      if (!interviewId) console.log('❌ No interviewId');
      if (!isActiveRef.current) console.log('❌ Monitoring not active (ref check)');
      return;
    }
    
    try {
      const video = videoRef.current;
      
      // Skip if video not ready or no stream
      if (!video.srcObject || video.readyState !== video.HAVE_ENOUGH_DATA) {
        console.log('⏳ Video not ready for frame capture yet...', {
          hasSrcObject: !!video.srcObject,
          readyState: video.readyState,
          HAVE_ENOUGH_DATA: video.HAVE_ENOUGH_DATA
        });
        return;
      }
      
      // Log first capture
      if (monitoring.frameCount === 0) {
        console.log('📸 First frame capture - Video ready:', {
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight,
          readyState: video.readyState
        });
      }
      
      // Create canvas to capture frame
      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
      }
      
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      // Draw current video frame to canvas
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to base64
      const frameData = canvas.toDataURL('image/jpeg', 0.8);
      
      // Send to backend for analysis
      const result = await api.monitoring.analyzeFrame(interviewId, frameData);
      
      if (result.success) {
        // Log periodic progress
        if (result.frame_number % 10 === 0) {
          console.log(`📊 Frame ${result.frame_number} analyzed - Risk: ${result.risk_level}, Score: ${result.risk_score.toFixed(2)}`);
        }
        
        // Update monitoring state
        setMonitoring(prev => ({
          ...prev,
          frameCount: result.frame_number,
          riskScore: result.risk_score,
          riskLevel: result.risk_level,
          detections: [...prev.detections, ...result.detections].slice(-50) // Keep last 50
        }));
        
        // Handle new warnings
        if (result.warnings && result.warnings.length > 0) {
          const newWarnings = result.warnings;
          
          setMonitoring(prev => ({
            ...prev,
            warnings: [...prev.warnings, ...newWarnings]
          }));
          
          // Show most severe warning
          const mostSevere = newWarnings.reduce((prev, current) => {
            const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
            return severityOrder[current.severity] > severityOrder[prev.severity] ? current : prev;
          });
          
          setRecentWarning(mostSevere);
          
          // Clear warning after 5 seconds
          setTimeout(() => {
            setRecentWarning(null);
          }, 5000);
          
          console.warn(`⚠️ ${mostSevere.severity.toUpperCase()}: ${mostSevere.message}`);
        }
      }
    } catch (error) {
      console.error('❌ Frame analysis failed:', error);
    }
  }, [interviewId, videoRef, monitoring.frameCount]);
  
  // Start frame analysis loop
  const startFrameAnalysis = useCallback(() => {
    console.log('🎬 startFrameAnalysis called');
    
    if (monitoringIntervalRef.current) {
      console.log('⚠️ Clearing existing interval');
      clearInterval(monitoringIntervalRef.current);
    }
    
    console.log('⏰ Setting up 2-second interval for frame capture');
    
    // Analyze frame every 2 seconds
    monitoringIntervalRef.current = setInterval(() => {
      console.log('⏰ Interval triggered - attempting frame capture');
      captureAndAnalyzeFrame();
    }, 2000);
    
    console.log('✅ Frame analysis interval started');
  }, [captureAndAnalyzeFrame]);
  
  // Start monitoring - accepts optional interview ID parameter
  const startMonitoring = useCallback(async (explicitInterviewId) => {
    const idToUse = explicitInterviewId || interviewId;
    
    if (!idToUse || !enabled) {
      console.log('CV Monitoring: Not starting - missing interviewId or disabled', {idToUse, enabled});
      return;
    }
    
    try {
      console.log(`🎥 Starting CV monitoring for interview ${idToUse}`);
      const response = await api.monitoring.start(idToUse);
      
      if (response.success) {
        isActiveRef.current = true; // Set ref immediately
        setMonitoring(prev => ({ ...prev, active: true }));
        console.log('✅ CV monitoring started successfully');
        
        // Wait 1 second for video to be fully ready before starting frame analysis
        setTimeout(() => {
          console.log('🎬 Starting frame analysis loop...');
          startFrameAnalysis();
        }, 1000);
      } else {
        console.warn('⚠️ CV monitoring not available:', response.error);
      }
    } catch (error) {
      console.error('❌ Failed to start CV monitoring:', error);
    }
  }, [interviewId, enabled, startFrameAnalysis]);
  
  // Stop monitoring
  const stopMonitoring = useCallback(async () => {
    if (!interviewId) return;
    
    try {
      console.log(`🏁 Stopping CV monitoring for interview ${interviewId}`);
      
      // Stop frame analysis loop
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
        monitoringIntervalRef.current = null;
      }
      
      isActiveRef.current = false; // Clear ref
      
      const report = await api.monitoring.stop(interviewId);
      
      if (report.success) {
        console.log('✅ CV monitoring stopped');
        console.log(`📊 Final Report - Risk: ${report.risk_level}, Warnings: ${report.total_warnings}`);
        setMonitoring(prev => ({
          ...prev,
          active: false,
          finalReport: report
        }));
        
        return report;
      }
    } catch (error) {
      console.error('❌ Failed to stop CV monitoring:', error);
    }
  }, [interviewId]);
  
  // Get monitoring status
  const getStatus = useCallback(async () => {
    if (!interviewId) return null;
    
    try {
      const status = await api.monitoring.getStatus(interviewId);
      return status;
    } catch (error) {
      console.error('Failed to get monitoring status:', error);
      return null;
    }
  }, [interviewId]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
      }
    };
  }, []);
  
  // Get warning statistics
  const getWarningStats = useCallback(() => {
    const warnings = monitoring.warnings;
    const stats = {
      total: warnings.length,
      critical: warnings.filter(w => w.severity === 'critical').length,
      high: warnings.filter(w => w.severity === 'high').length,
      medium: warnings.filter(w => w.severity === 'medium').length,
      low: warnings.filter(w => w.severity === 'low').length
    };
    
    // Count by type
    const byType = {};
    warnings.forEach(w => {
      byType[w.type] = (byType[w.type] || 0) + 1;
    });
    stats.byType = byType;
    
    return stats;
  }, [monitoring.warnings]);
  
  return {
    monitoring,
    recentWarning,
    startMonitoring,
    stopMonitoring,
    getStatus,
    getWarningStats,
    clearWarning: () => setRecentWarning(null)
  };
};
