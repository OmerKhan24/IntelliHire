# CV Monitoring System - Setup Guide

## Overview
The CV Monitoring System provides real-time face detection, gaze tracking, and mobile phone detection during interviews to ensure integrity and prevent cheating.

## Features

### 1. **Face Detection**
- Detects if candidate is present in frame
- Alerts when face is absent for extended period
- Detects multiple faces (potential help from others)
- Tracks face position for suspicious movements

### 2. **Gaze Tracking**
- Monitors eye movement and gaze direction
- Detects when candidate looks away from camera
- Calculates gaze deviation from center
- Alerts on excessive deviation

### 3. **Mobile Phone Detection**
- Uses YOLO object detection to identify phones
- Detects laptops, books, and other suspicious objects
- Provides confidence scores for detections
- Tracks detection frequency

### 4. **Movement Analysis**
- Analyzes frame-to-frame changes
- Detects excessive or suspicious movements
- Calculates movement scores

### 5. **Risk Scoring**
- Real-time risk score calculation (0-1)
- Categorizes risk levels: low, medium, high, critical
- Weighted by alert severity
- Historical tracking of violations

## Installation

### Backend Dependencies

1. **Install Python packages:**
```bash
cd backend
pip install -r requirements.txt
```

Key packages:
- `opencv-python==4.8.1.78` - Computer vision operations
- `mediapipe==0.10.8` - Face detection and mesh
- `ultralytics==8.0.200` - YOLO object detection
- `numpy==1.24.3` - Array operations

2. **Download YOLO model (automatic on first run):**
The system will automatically download `yolov8n.pt` (YOLOv8 Nano) on first initialization.

### Frontend Integration

1. **Install hooks:**
The `useCVMonitoring` hook is already included in `frontend/src/hooks/`

2. **Import components:**
```javascript
import { useCVMonitoring } from '../hooks/useCVMonitoring';
import MonitoringAlert from '../components/MonitoringAlert';
```

## Usage

### Backend API

#### Start Monitoring
```
POST /api/monitoring/start/<interview_id>
```
Initializes CV monitoring for an interview.

**Response:**
```json
{
  "success": true,
  "message": "Monitoring started",
  "interview_id": 123
}
```

#### Analyze Frame
```
POST /api/monitoring/analyze/<interview_id>
Body: { "frame": "base64_encoded_image_data" }
```
Analyzes a video frame for violations.

**Response:**
```json
{
  "success": true,
  "frame_number": 150,
  "detections": [
    {
      "timestamp": 1234567890.123,
      "type": "object_detection_cell_phone",
      "alert_level": "critical",
      "confidence": 0.87,
      "message": "Detected cell phone",
      "details": { ... }
    }
  ],
  "warnings": [
    {
      "timestamp": "2025-12-04T00:30:15",
      "type": "object_detection_cell_phone",
      "message": "Detected cell phone",
      "severity": "critical"
    }
  ],
  "risk_score": 0.45,
  "risk_level": "medium"
}
```

#### Get Status
```
GET /api/monitoring/status/<interview_id>
```
Retrieves current monitoring status.

#### Stop Monitoring
```
POST /api/monitoring/stop/<interview_id>
```
Stops monitoring and returns final report.

**Response:**
```json
{
  "success": true,
  "interview_id": 123,
  "duration_seconds": 1200,
  "total_frames_analyzed": 600,
  "total_detections": 45,
  "total_warnings": 8,
  "final_risk_score": 0.35,
  "risk_level": "medium",
  "detection_breakdown": {
    "gaze_deviation": 20,
    "face_absence": 5,
    "object_detection_cell_phone": 3
  },
  "critical_events": [ ... ]
}
```

### Frontend Integration

#### In Interview Component

```javascript
import { useCVMonitoring } from '../hooks/useCVMonitoring';
import MonitoringAlert from '../components/MonitoringAlert';

function CandidateInterview() {
  const videoRef = useRef(null);
  const [interviewId, setInterviewId] = useState(null);
  
  // Initialize CV monitoring
  const {
    monitoring,
    recentWarning,
    startMonitoring,
    stopMonitoring,
    clearWarning,
    getWarningStats
  } = useCVMonitoring(interviewId, videoRef, true);
  
  // Start monitoring when interview starts
  useEffect(() => {
    if (interviewId && videoRef.current) {
      startMonitoring();
    }
    
    return () => {
      stopMonitoring();
    };
  }, [interviewId]);
  
  return (
    <>
      <video ref={videoRef} autoPlay muted />
      
      <MonitoringAlert
        warning={recentWarning}
        riskScore={monitoring.riskScore}
        riskLevel={monitoring.riskLevel}
        onDismiss={clearWarning}
      />
      
      {/* Rest of interview UI */}
    </>
  );
}
```

## Detection Types

### Face-Related
- `face_absence` - Candidate not visible in frame
- `multiple_faces` - More than one person detected
- `significant_movement` - Large position changes

### Gaze-Related
- `gaze_deviation` - Looking away from camera

### Object-Related
- `object_detection_cell_phone` - Phone detected
- `object_detection_laptop` - Laptop detected
- `object_detection_book` - Book detected
- `object_detection_person` - Additional person detected

### Movement-Related
- `excessive_movement` - Unusual frame changes

## Alert Levels

1. **LOW** - Minor issues, normal behavior
2. **MEDIUM** - Worth noting, potential concern
3. **HIGH** - Significant violation, needs attention
4. **CRITICAL** - Serious violation, immediate action required

## Risk Score Calculation

Risk score is calculated based on:
- Number of detections
- Severity of each detection (weighted)
- Confidence of detections
- Time window (recent violations weighted more)

**Formula:**
```
risk_score = Σ(alert_weight × confidence) / max_possible_score
```

**Weights:**
- LOW: 1
- MEDIUM: 3
- HIGH: 7
- CRITICAL: 15

## Configuration

### Thresholds (in cv_monitoring.py)

```python
config = {
    "face_absence_threshold": 30,        # frames before alert
    "multiple_face_threshold": 10,       # frames before alert
    "phone_detection_threshold": 5,      # frames before alert
    "gaze_deviation_threshold": 0.3,     # normalized (0-1)
    "movement_threshold": 50,            # pixels
    "confidence_threshold": 0.5          # detection confidence
}
```

### Frame Analysis Rate

Frontend sends frames every **2 seconds** for analysis (configurable in `useCVMonitoring.js`).

## Performance Considerations

### Backend
- YOLO Nano (yolov8n) used for speed vs accuracy balance
- Frame analysis takes ~100-500ms depending on hardware
- GPU acceleration recommended for production

### Frontend
- Canvas API used for frame capture
- JPEG compression (0.8 quality) to reduce data size
- Frames sent asynchronously to avoid blocking UI
- Only last 50 detections kept in memory

## Troubleshooting

### "CV models initialization failed"
- Check that all dependencies are installed: `pip install -r requirements.txt`
- Verify YOLO model downloaded: should see `yolov8n.pt` in working directory
- Check system has sufficient RAM (minimum 4GB recommended)

### "Failed to decode frame"
- Ensure frame data is valid base64
- Check video element has valid source
- Verify webcam permissions granted

### High CPU/Memory Usage
- Reduce frame analysis frequency (increase interval from 2s to 3s or 5s)
- Use smaller frame resolution before encoding
- Consider reducing JPEG quality further

### False Positives
- Adjust confidence thresholds in config
- Increase frame thresholds before triggering alerts
- Fine-tune gaze deviation threshold for lighting conditions

## Future Enhancements

- [ ] Audio analysis for background voices
- [ ] Screen sharing detection
- [ ] Emotion analysis
- [ ] Lip sync verification for speech
- [ ] Advanced anti-spoofing (liveness detection)
- [ ] ML model for suspicious behavior patterns
- [ ] Real-time alerts to interviewer dashboard
- [ ] Configurable per-job monitoring settings

## Support

For issues or questions about CV monitoring:
1. Check logs in backend terminal
2. Verify all dependencies installed correctly
3. Test with demo script: `python ai_models/modules/cv_monitoring.py`
4. Review monitoring status API for diagnostic info
