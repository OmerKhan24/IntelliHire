"""
CV Monitoring Service - Backend integration for face detection, gaze tracking, and mobile detection
Enhanced with debugging and diagnostics
"""
import os
import sys
import cv2
import numpy as np
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
import base64

# Add ai_models directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(os.path.dirname(current_dir))
ai_models_path = os.path.join(project_root, 'ai_models')
sys.path.insert(0, ai_models_path)

try:
    from modules.cv_monitoring import CVMonitoringSystem, AlertLevel, DetectionResult
    print("✅ CV Monitoring module imported successfully")
    CV_MODULE_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ Warning: Could not import CV monitoring module: {e}")
    print(f"   CV monitoring will not be available")
    CVMonitoringSystem = None
    AlertLevel = None
    CV_MODULE_AVAILABLE = False

logger = logging.getLogger(__name__)

class CVMonitoringService:
    """Service for real-time CV monitoring during interviews"""
    
    def __init__(self):
        """Initialize CV monitoring service"""
        self.cv_system = None
        self.enabled = False
        self.interview_monitors = {}  # interview_id -> monitoring data
        self.debug_mode = True  # Enable detailed logging
        
        # Create screenshots directory
        self.screenshots_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads', 'cv_screenshots')
        os.makedirs(self.screenshots_dir, exist_ok=True)
        
        self._initialize_cv_system()
    
    def _initialize_cv_system(self):
        """Initialize CV monitoring system"""
        try:
            print("🎥 Initializing CV Monitoring Service...")
            
            if not CV_MODULE_AVAILABLE:
                logger.warning("CV Monitoring module not available")
                print("⚠️ CV Monitoring module not available - models will not load")
                print(f"   Searched in: {ai_models_path}")
                print(f"   Path exists: {os.path.exists(ai_models_path)}")
                return
            
            print("📦 Creating CVMonitoringSystem instance...")
            self.cv_system = CVMonitoringSystem()
            
            # Try to initialize models
            print("🔧 Initializing CV models...")
            if self.cv_system.initialize_models():
                self.enabled = True
                print("✅ CV Monitoring Service enabled")
                logger.info("✅ CV Monitoring Service enabled")
                
                # Log which detectors are active
                if hasattr(self.cv_system, 'face_detector'):
                    print("  ✓ Face detector loaded")
                if hasattr(self.cv_system, 'gaze_tracker'):
                    print("  ✓ Gaze tracker loaded")
                if hasattr(self.cv_system, 'mobile_detector'):
                    print("  ✓ Mobile detector loaded")
            else:
                print("❌ CV models initialization failed - service disabled")
                logger.warning("⚠️ CV models initialization failed - service disabled")
                self.enabled = False
                
        except Exception as e:
            print(f"❌ Failed to initialize CV monitoring: {e}")
            logger.error(f"❌ Failed to initialize CV monitoring: {e}")
            import traceback
            traceback.print_exc()
            self.enabled = False
    
    def start_monitoring(self, interview_id: int) -> bool:
        """
        Start monitoring for an interview
        
        Args:
            interview_id: Interview ID
            
        Returns:
            True if monitoring started successfully
        """
        try:
            if not self.enabled:
                logger.warning(f"CV monitoring not enabled for interview {interview_id}")
                print(f"⚠️ Cannot start monitoring - service not enabled")
                return False
            
            self.interview_monitors[interview_id] = {
                'start_time': datetime.now(),
                'frame_count': 0,
                'detections': [],
                'warnings': [],
                'risk_score': 0.0,
                'active': True,
                'last_frame_time': None,
                'processing_times': []
            }
            
            logger.info(f"🎥 Started CV monitoring for interview {interview_id}")
            print(f"🎥 CV Monitoring started for interview {interview_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to start monitoring for interview {interview_id}: {e}")
            return False
    
    def analyze_frame(self, interview_id: int, frame_data: str) -> Dict[str, Any]:
        """
        Analyze a video frame from the interview
        
        Args:
            interview_id: Interview ID
            frame_data: Base64 encoded frame data
            
        Returns:
            Analysis results with detections and warnings
        """
        start_time = datetime.now()
        
        if not self.enabled or self.cv_system is None:
            return {
                'success': False,
                'error': 'CV monitoring not available',
                'detections': [],
                'debug': {
                    'enabled': self.enabled,
                    'cv_system_exists': self.cv_system is not None,
                    'module_available': CV_MODULE_AVAILABLE
                }
            }
        
        try:
            # Check if monitoring is active for this interview
            if interview_id not in self.interview_monitors:
                print(f"⚠️ No monitoring session found for interview {interview_id}")
                return {
                    'success': False,
                    'error': 'Monitoring not started for this interview',
                    'detections': []
                }
            
            monitor_data = self.interview_monitors[interview_id]
            
            if not monitor_data['active']:
                return {
                    'success': False,
                    'error': 'Monitoring is not active',
                    'detections': []
                }
            
            # Decode base64 frame
            if self.debug_mode and monitor_data['frame_count'] % 30 == 0:
                print(f"📸 Processing frame {monitor_data['frame_count']} for interview {interview_id}")
            
            frame = self._decode_frame(frame_data)
            
            if frame is None:
                print(f"❌ Failed to decode frame {monitor_data['frame_count']}")
                return {
                    'success': False,
                    'error': 'Failed to decode frame',
                    'detections': []
                }
            
            # Log frame info on first frame or periodically
            if monitor_data['frame_count'] == 0 or monitor_data['frame_count'] % 100 == 0:
                print(f"📊 Frame info: shape={frame.shape}, dtype={frame.dtype}")
            
            # Analyze frame
            if self.debug_mode and monitor_data['frame_count'] % 30 == 0:
                print(f"🔍 Analyzing frame with CV system...")
            
            detections = self.cv_system.analyze_frame(frame)
            
            # DEBUG: Log detection results
            if detections and len(detections) > 0:
                print(f"🚨 DETECTIONS FOUND: {len(detections)} detections in frame {monitor_data['frame_count']}")
                for det in detections:
                    print(f"   - Type: {det.detection_type}, Alert: {det.alert_level.value}, Confidence: {det.confidence:.2f}")
            elif monitor_data['frame_count'] % 100 == 0:
                print(f"✓ Frame {monitor_data['frame_count']}: No violations detected")
            
            # Update monitoring data
            monitor_data['frame_count'] += 1
            monitor_data['last_frame_time'] = datetime.now()
            
            # Process detections
            processed_detections = []
            warnings = []
            
            for detection in detections:
                detection_dict = {
                    'timestamp': detection.timestamp,
                    'type': detection.detection_type,
                    'alert_level': detection.alert_level.value,
                    'confidence': detection.confidence,
                    'message': detection.details.get('message', ''),
                    'details': detection.details
                }
                
                processed_detections.append(detection_dict)
                monitor_data['detections'].append(detection_dict)
                
                # Add warning if alert level is HIGH or CRITICAL
                if detection.alert_level.value in ['high', 'critical']:
                    # Save screenshot for critical alerts
                    screenshot_path = self._save_screenshot(frame, interview_id, detection)
                    detection_dict['screenshot'] = screenshot_path
                    
                    warning = {
                        'timestamp': datetime.now().isoformat(),
                        'type': detection.detection_type,
                        'message': detection.details.get('message', ''),
                        'severity': detection.alert_level.value
                    }
                    warnings.append(warning)
                    monitor_data['warnings'].append(warning)
                    print(f"⚠️ WARNING: {warning['type']} - {warning['message']}")
            
            # Update risk score
            summary = self.cv_system.get_monitoring_summary(time_window=60)
            monitor_data['risk_score'] = summary['risk_score']
            
            # Track processing time
            processing_time = (datetime.now() - start_time).total_seconds()
            monitor_data['processing_times'].append(processing_time)
            
            # Log performance periodically
            if monitor_data['frame_count'] % 100 == 0:
                avg_time = sum(monitor_data['processing_times'][-100:]) / min(100, len(monitor_data['processing_times']))
                print(f"⚡ Performance: {avg_time*1000:.1f}ms avg processing time")
            
            return {
                'success': True,
                'frame_number': monitor_data['frame_count'],
                'detections': processed_detections,
                'warnings': warnings,
                'risk_score': summary['risk_score'],
                'risk_level': summary['risk_level'],
                'processing_time_ms': processing_time * 1000,
                'debug': {
                    'frame_shape': frame.shape,
                    'total_detections': len(monitor_data['detections']),
                    'total_warnings': len(monitor_data['warnings'])
                } if self.debug_mode else None
            }
            
        except Exception as e:
            logger.error(f"Frame analysis failed for interview {interview_id}: {e}")
            print(f"❌ Frame analysis error: {e}")
            import traceback
            traceback.print_exc()
            return {
                'success': False,
                'error': str(e),
                'detections': []
            }
    
    def _decode_frame(self, frame_data: str) -> Optional[np.ndarray]:
        """Decode base64 frame data to numpy array"""
        try:
            # Remove data URL prefix if present
            if ',' in frame_data:
                frame_data = frame_data.split(',')[1]
            
            # Decode base64
            img_bytes = base64.b64decode(frame_data)
            
            if len(img_bytes) == 0:
                print("❌ Decoded 0 bytes from frame data")
                return None
            
            # Convert to numpy array
            nparr = np.frombuffer(img_bytes, np.uint8)
            
            # Decode image
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if frame is None:
                print("❌ cv2.imdecode returned None")
            
            return frame
            
        except Exception as e:
            logger.error(f"Failed to decode frame: {e}")
            print(f"❌ Frame decode error: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def _save_screenshot(self, frame: np.ndarray, interview_id: int, detection: Any) -> Optional[str]:
        """Save screenshot of critical alert"""
        try:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_%f')
            filename = f"interview_{interview_id}_{detection.detection_type}_{timestamp}.jpg"
            filepath = os.path.join(self.screenshots_dir, filename)
            
            # Add alert information overlay
            frame_copy = frame.copy()
            text = f"{detection.detection_type.upper()}: {detection.alert_level.value}"
            cv2.putText(frame_copy, text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
            
            # Save image
            cv2.imwrite(filepath, frame_copy)
            
            # Return relative path for database storage
            return f"cv_screenshots/{filename}"
            
        except Exception as e:
            logger.error(f"Failed to save screenshot: {e}")
            return None
    
    def stop_monitoring(self, interview_id: int) -> Dict[str, Any]:
        """
        Stop monitoring and get final summary
        
        Args:
            interview_id: Interview ID
            
        Returns:
            Final monitoring summary
        """
        try:
            if interview_id not in self.interview_monitors:
                return {
                    'success': False,
                    'error': 'No monitoring data found'
                }
            
            monitor_data = self.interview_monitors[interview_id]
            monitor_data['active'] = False
            monitor_data['end_time'] = datetime.now()
            
            # Calculate duration
            duration = (monitor_data['end_time'] - monitor_data['start_time']).total_seconds()
            
            # Get final summary from CV system
            summary = self.cv_system.get_monitoring_summary(time_window=int(duration))
            
            # Extract critical events with screenshots from monitor_data
            critical_events_with_screenshots = [
                detection for detection in monitor_data['detections']
                if detection.get('alert_level') == 'critical' and detection.get('screenshot')
            ]
            
            # If no critical events with screenshots, get high-alert events as well
            if len(critical_events_with_screenshots) < 5:
                high_alert_events = [
                    detection for detection in monitor_data['detections']
                    if detection.get('alert_level') in ['critical', 'high'] and detection.get('screenshot')
                ]
                critical_events_with_screenshots = high_alert_events[-10:]  # Last 10 critical/high alerts
            
            # Compile final report
            report = {
                'success': True,
                'interview_id': interview_id,
                'duration_seconds': duration,
                'total_frames_analyzed': monitor_data['frame_count'],
                'total_detections': len(monitor_data['detections']),
                'total_warnings': len(monitor_data['warnings']),
                'final_risk_score': summary['risk_score'],
                'risk_level': summary['risk_level'],
                'detection_breakdown': summary['detection_counts'],
                'alert_level_breakdown': summary['alert_level_counts'],
                'critical_events': critical_events_with_screenshots,  # Include screenshots
                'warnings': monitor_data['warnings'][-20:],  # Last 20 warnings
                'avg_processing_time_ms': sum(monitor_data['processing_times']) / len(monitor_data['processing_times']) * 1000 if monitor_data['processing_times'] else 0
            }
            
            logger.info(f"🏁 Stopped CV monitoring for interview {interview_id} - Risk: {report['risk_level']}")
            print(f"🏁 CV Monitoring stopped for interview {interview_id}")
            print(f"   Frames analyzed: {report['total_frames_analyzed']}")
            print(f"   Total detections: {report['total_detections']}")
            print(f"   Total warnings: {report['total_warnings']}")
            print(f"   Final risk: {report['risk_level']}")
            
            return report
            
        except Exception as e:
            logger.error(f"Failed to stop monitoring for interview {interview_id}: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_monitoring_status(self, interview_id: int) -> Dict[str, Any]:
        """
        Get current monitoring status
        
        Args:
            interview_id: Interview ID
            
        Returns:
            Current monitoring status
        """
        try:
            if interview_id not in self.interview_monitors:
                return {
                    'active': False,
                    'error': 'Monitoring not started'
                }
            
            monitor_data = self.interview_monitors[interview_id]
            
            # Get recent summary
            summary = self.cv_system.get_monitoring_summary(time_window=60)
            
            return {
                'active': monitor_data['active'],
                'frame_count': monitor_data['frame_count'],
                'detection_count': len(monitor_data['detections']),
                'warning_count': len(monitor_data['warnings']),
                'current_risk_score': summary['risk_score'],
                'risk_level': summary['risk_level'],
                'recent_warnings': monitor_data['warnings'][-5:]  # Last 5 warnings
            }
            
        except Exception as e:
            logger.error(f"Failed to get status for interview {interview_id}: {e}")
            return {
                'active': False,
                'error': str(e)
            }
    
    def test_detection(self, test_image_path: str = None) -> Dict[str, Any]:
        """
        Test the CV monitoring system with a test image
        
        Args:
            test_image_path: Optional path to test image
            
        Returns:
            Test results
        """
        if not self.enabled:
            return {
                'success': False,
                'error': 'CV monitoring not enabled'
            }
        
        try:
            # Create a test frame if no image provided
            if test_image_path and os.path.exists(test_image_path):
                frame = cv2.imread(test_image_path)
            else:
                # Create a blank test frame
                frame = np.zeros((480, 640, 3), dtype=np.uint8)
            
            print("🧪 Running detection test...")
            detections = self.cv_system.analyze_frame(frame)
            
            print(f"   Found {len(detections)} detections")
            for det in detections:
                print(f"   - {det.detection_type}: {det.alert_level.value}")
            
            return {
                'success': True,
                'detections_found': len(detections),
                'detections': [
                    {
                        'type': d.detection_type,
                        'alert_level': d.alert_level.value,
                        'confidence': d.confidence
                    } for d in detections
                ]
            }
            
        except Exception as e:
            print(f"❌ Test failed: {e}")
            import traceback
            traceback.print_exc()
            return {
                'success': False,
                'error': str(e)
            }


# Global instance
cv_monitoring_service = CVMonitoringService()

# Run a test on startup if enabled
if cv_monitoring_service.enabled:
    print("\n" + "="*50)
    print("🧪 Running CV Monitoring Self-Test...")
    print("="*50)
    test_result = cv_monitoring_service.test_detection()
    print(f"Test result: {test_result}")
    print("="*50 + "\n")