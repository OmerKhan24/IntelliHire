"""
Computer Vision Monitoring Module
Detects cheating behaviors: mobile phones, multiple faces, gaze tracking, suspicious movements
"""
import cv2
import numpy as np
import logging
from typing import Dict, List, Any, Tuple, Optional
import time
from dataclasses import dataclass
from enum import Enum

# Imports will work when run in proper environment
try:
    import mediapipe as mp
    from ultralytics import YOLO
except ImportError as e:
    print(f"Warning: Some imports failed - {e}. Module will work in proper environment.")

logger = logging.getLogger(__name__)

class AlertLevel(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class DetectionResult:
    """Result of a detection analysis"""
    timestamp: float
    alert_level: AlertLevel
    detection_type: str
    confidence: float
    details: Dict[str, Any]
    frame_data: Optional[np.ndarray] = None

class CVMonitoringSystem:
    """Computer Vision based monitoring system for interview integrity"""
    
    def __init__(self):
        """Initialize CV monitoring system"""
        self.mp_face_detection = None
        self.mp_face_mesh = None
        self.mp_hands = None
        self.yolo_model = None
        self.face_detector = None
        
        # Monitoring state
        self.baseline_face_position = None
        self.face_absence_count = 0
        self.multiple_face_count = 0
        self.phone_detection_count = 0
        self.suspicious_movement_count = 0
        
        # Configuration
        self.config = {
            "face_absence_threshold": 30,  # frames
            "multiple_face_threshold": 10,  # frames
            "phone_detection_threshold": 5,  # frames
            "gaze_deviation_threshold": 0.3,  # normalized
            "movement_threshold": 50,  # pixels
            "confidence_threshold": 0.5
        }
        
        # Detection history
        self.detection_history = []
        
    def initialize_models(self) -> bool:
        """Initialize all CV models"""
        try:
            # Initialize MediaPipe
            mp_module = mp
            self.mp_face_detection = mp_module.solutions.face_detection
            self.mp_face_mesh = mp_module.solutions.face_mesh
            self.mp_hands = mp_module.solutions.hands
            
            self.face_detector = self.mp_face_detection.FaceDetection(
                model_selection=1, min_detection_confidence=0.5
            )
            
            # Initialize YOLO for object detection
            self.yolo_model = YOLO('yolov8n.pt')  # Using nano version for speed
            
            logger.info("CV models initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize CV models: {e}")
            return False
    
    def analyze_frame(self, frame: np.ndarray) -> List[DetectionResult]:
        """
        Analyze a single frame for various violations
        
        Args:
            frame: Input video frame
            
        Returns:
            List of detection results
        """
        if frame is None:
            return []
        
        results = []
        timestamp = time.time()
        
        try:
            # Convert BGR to RGB for MediaPipe
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Face detection and analysis
            face_results = self._analyze_faces(rgb_frame, timestamp)
            results.extend(face_results)
            
            # Object detection (phones, multiple people, etc.)
            object_results = self._detect_objects(frame, timestamp)
            results.extend(object_results)
            
            # Gaze tracking
            gaze_results = self._analyze_gaze(rgb_frame, timestamp)
            results.extend(gaze_results)
            
            # Movement analysis
            movement_results = self._analyze_movement(frame, timestamp)
            results.extend(movement_results)
            
            # Store results in history
            self.detection_history.extend(results)
            
            # Keep history manageable (last 1000 detections)
            if len(self.detection_history) > 1000:
                self.detection_history = self.detection_history[-1000:]
            
            return results
            
        except Exception as e:
            logger.error(f"Frame analysis failed: {e}")
            return []
    
    def _analyze_faces(self, rgb_frame: np.ndarray, timestamp: float) -> List[DetectionResult]:
        """Analyze faces in the frame"""
        results = []
        
        try:
            if not self.face_detector:
                return results
            
            # Detect faces
            face_results = self.face_detector.process(rgb_frame)
            
            if not face_results.detections:
                # No face detected
                self.face_absence_count += 1
                
                if self.face_absence_count > self.config["face_absence_threshold"]:
                    results.append(DetectionResult(
                        timestamp=timestamp,
                        alert_level=AlertLevel.HIGH,
                        detection_type="face_absence",
                        confidence=1.0,
                        details={
                            "message": "Candidate not visible in frame",
                            "duration": self.face_absence_count,
                            "threshold": self.config["face_absence_threshold"]
                        }
                    ))
            else:
                self.face_absence_count = 0  # Reset counter
                
                # Check for multiple faces
                num_faces = len(face_results.detections)
                if num_faces > 1:
                    self.multiple_face_count += 1
                    
                    if self.multiple_face_count > self.config["multiple_face_threshold"]:
                        results.append(DetectionResult(
                            timestamp=timestamp,
                            alert_level=AlertLevel.CRITICAL,
                            detection_type="multiple_faces",
                            confidence=0.9,
                            details={
                                "message": f"Multiple faces detected: {num_faces}",
                                "face_count": num_faces,
                                "duration": self.multiple_face_count
                            }
                        ))
                else:
                    self.multiple_face_count = 0
                
                # Analyze face position for establishment of baseline
                if num_faces == 1:
                    detection = face_results.detections[0]
                    bbox = detection.location_data.relative_bounding_box
                    
                    current_position = {
                        "x": bbox.xmin + bbox.width / 2,
                        "y": bbox.ymin + bbox.height / 2,
                        "width": bbox.width,
                        "height": bbox.height
                    }
                    
                    if self.baseline_face_position is None:
                        self.baseline_face_position = current_position
                    else:
                        # Check for significant position change
                        pos_change = self._calculate_position_change(
                            self.baseline_face_position, current_position
                        )
                        
                        if pos_change > self.config["movement_threshold"]:
                            results.append(DetectionResult(
                                timestamp=timestamp,
                                alert_level=AlertLevel.MEDIUM,
                                detection_type="significant_movement",
                                confidence=0.7,
                                details={
                                    "message": "Significant position change detected",
                                    "position_change": pos_change,
                                    "threshold": self.config["movement_threshold"]
                                }
                            ))
            
            return results
            
        except Exception as e:
            logger.error(f"Face analysis failed: {e}")
            return results
    
    def _detect_objects(self, frame: np.ndarray, timestamp: float) -> List[DetectionResult]:
        """Detect suspicious objects (phones, laptops, etc.)"""
        results = []
        
        try:
            if not self.yolo_model:
                return results
            
            # Run YOLO detection
            detections = self.yolo_model(frame, verbose=False)
            
            # Count persons detected (to identify multiple people)
            person_count = 0
            
            # Analyze detected objects
            for detection in detections:
                boxes = detection.boxes
                if boxes is not None:
                    for box in boxes:
                        class_id = int(box.cls[0])
                        confidence = float(box.conf[0])
                        
                        if confidence > self.config["confidence_threshold"]:
                            class_name = self.yolo_model.names[class_id]
                            
                            # Count persons
                            if class_name == 'person':
                                person_count += 1
                            
                            # Check for suspicious objects (exclude person, handle separately)
                            if class_name in ['cell phone', 'laptop', 'book']:
                                alert_level = self._get_object_alert_level(class_name, confidence)
                                
                                if class_name == 'cell phone':
                                    self.phone_detection_count += 1
                                
                                results.append(DetectionResult(
                                    timestamp=timestamp,
                                    alert_level=alert_level,
                                    detection_type=f"object_detection_{class_name.replace(' ', '_')}",
                                    confidence=confidence,
                                    details={
                                        "message": f"Detected {class_name}",
                                        "object_class": class_name,
                                        "bbox": box.xyxy[0].tolist(),
                                        "detection_count": self.phone_detection_count if class_name == 'cell phone' else 1
                                    }
                                ))
            
            # Only flag if multiple persons detected (more than the candidate)
            if person_count > 1:
                results.append(DetectionResult(
                    timestamp=timestamp,
                    alert_level=AlertLevel.CRITICAL,
                    detection_type="multiple_persons_detected",
                    confidence=0.9,
                    details={
                        "message": f"Multiple persons in frame: {person_count}",
                        "person_count": person_count
                    }
                ))
            
            return results
            
        except Exception as e:
            logger.error(f"Object detection failed: {e}")
            return results
    
    def _analyze_gaze(self, rgb_frame: np.ndarray, timestamp: float) -> List[DetectionResult]:
        """Analyze gaze direction using face mesh"""
        results = []
        
        try:
            if not self.mp_face_mesh:
                return results
            
            with self.mp_face_mesh.FaceMesh(
                max_num_faces=1,
                refine_landmarks=True,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5
            ) as face_mesh:
                
                mesh_results = face_mesh.process(rgb_frame)
                
                if mesh_results.multi_face_landmarks:
                    for face_landmarks in mesh_results.multi_face_landmarks:
                        # Calculate gaze direction
                        gaze_info = self._calculate_gaze_direction(face_landmarks, rgb_frame.shape)
                        
                        if gaze_info["deviation"] > self.config["gaze_deviation_threshold"]:
                            results.append(DetectionResult(
                                timestamp=timestamp,
                                alert_level=AlertLevel.MEDIUM,
                                detection_type="gaze_deviation",
                                confidence=gaze_info["confidence"],
                                details={
                                    "message": "Looking away from camera",
                                    "gaze_direction": gaze_info["direction"],
                                    "deviation": gaze_info["deviation"],
                                    "threshold": self.config["gaze_deviation_threshold"]
                                }
                            ))
            
            return results
            
        except Exception as e:
            logger.error(f"Gaze analysis failed: {e}")
            return results
    
    def _analyze_movement(self, frame: np.ndarray, timestamp: float) -> List[DetectionResult]:
        """Analyze frame-to-frame movement"""
        results = []
        
        try:
            # This would typically compare with previous frame
            # For demo, we'll simulate movement detection
            
            # In real implementation, you would:
            # 1. Store previous frame
            # 2. Calculate optical flow or frame difference
            # 3. Detect significant movements
            
            # Simulated movement detection
            if hasattr(self, '_prev_frame') and self._prev_frame is not None:
                # Calculate frame difference
                diff = cv2.absdiff(frame, self._prev_frame)
                movement_score = np.mean(diff)
                
                if movement_score > 30:  # Threshold for significant movement
                    results.append(DetectionResult(
                        timestamp=timestamp,
                        alert_level=AlertLevel.LOW,
                        detection_type="excessive_movement",
                        confidence=0.6,
                        details={
                            "message": "Excessive movement detected",
                            "movement_score": movement_score,
                            "threshold": 30
                        }
                    ))
            
            # Store current frame for next comparison
            self._prev_frame = frame.copy()
            
            return results
            
        except Exception as e:
            logger.error(f"Movement analysis failed: {e}")
            return results
    
    def _calculate_position_change(self, baseline: Dict, current: Dict) -> float:
        """Calculate position change between baseline and current position"""
        dx = abs(current["x"] - baseline["x"])
        dy = abs(current["y"] - baseline["y"])
        return np.sqrt(dx**2 + dy**2) * 100  # Convert to percentage
    
    def _get_object_alert_level(self, object_class: str, confidence: float) -> AlertLevel:
        """Determine alert level based on detected object"""
        if object_class == 'cell phone':
            return AlertLevel.CRITICAL if confidence > 0.8 else AlertLevel.HIGH
        elif object_class == 'laptop':
            return AlertLevel.HIGH if confidence > 0.7 else AlertLevel.MEDIUM
        elif object_class == 'book':
            return AlertLevel.MEDIUM
        else:
            return AlertLevel.LOW
    
    def _calculate_gaze_direction(self, face_landmarks, frame_shape) -> Dict[str, Any]:
        """Calculate gaze direction from face landmarks"""
        try:
            # Get eye landmarks (simplified calculation)
            left_eye_indices = [33, 133, 157, 158, 159, 160, 161, 163]
            right_eye_indices = [362, 398, 384, 385, 386, 387, 388, 466]
            
            h, w = frame_shape[:2]
            
            # Calculate eye centers
            left_eye_center = np.mean([
                [face_landmarks.landmark[i].x * w, face_landmarks.landmark[i].y * h]
                for i in left_eye_indices
            ], axis=0)
            
            right_eye_center = np.mean([
                [face_landmarks.landmark[i].x * w, face_landmarks.landmark[i].y * h]
                for i in right_eye_indices
            ], axis=0)
            
            # Calculate gaze vector (simplified)
            eye_center = (left_eye_center + right_eye_center) / 2
            face_center = np.array([w/2, h/2])
            
            gaze_vector = eye_center - face_center
            deviation = np.linalg.norm(gaze_vector) / (w/2)  # Normalize
            
            # Determine direction
            direction = "center"
            if abs(gaze_vector[0]) > abs(gaze_vector[1]):
                direction = "right" if gaze_vector[0] > 0 else "left"
            else:
                direction = "down" if gaze_vector[1] > 0 else "up"
            
            return {
                "direction": direction,
                "deviation": deviation,
                "confidence": 0.7,  # Simplified confidence
                "vector": gaze_vector.tolist()
            }
            
        except Exception as e:
            logger.error(f"Gaze calculation failed: {e}")
            return {"direction": "unknown", "deviation": 0, "confidence": 0, "vector": [0, 0]}
    
    def get_monitoring_summary(self, time_window: int = 300) -> Dict[str, Any]:
        """
        Get monitoring summary for the last time window
        
        Args:
            time_window: Time window in seconds
            
        Returns:
            Summary of monitoring results
        """
        current_time = time.time()
        cutoff_time = current_time - time_window
        
        # Filter recent detections
        recent_detections = [
            d for d in self.detection_history 
            if d.timestamp > cutoff_time
        ]
        
        # Count by type and alert level
        detection_counts = {}
        alert_counts = {level.value: 0 for level in AlertLevel}
        
        for detection in recent_detections:
            detection_type = detection.detection_type
            detection_counts[detection_type] = detection_counts.get(detection_type, 0) + 1
            alert_counts[detection.alert_level.value] += 1
        
        # Calculate risk score
        risk_score = self._calculate_risk_score(recent_detections)
        
        return {
            "time_window": time_window,
            "total_detections": len(recent_detections),
            "detection_counts": detection_counts,
            "alert_level_counts": alert_counts,
            "risk_score": risk_score,
            "risk_level": self._get_risk_level(risk_score),
            "recent_critical_events": [
                {
                    "timestamp": d.timestamp,
                    "type": d.detection_type,
                    "details": d.details
                }
                for d in recent_detections
                if d.alert_level == AlertLevel.CRITICAL
            ][-5:]  # Last 5 critical events
        }
    
    def _calculate_risk_score(self, detections: List[DetectionResult]) -> float:
        """Calculate overall risk score based on detections"""
        if not detections:
            return 0.0
        
        weights = {
            AlertLevel.LOW: 1,
            AlertLevel.MEDIUM: 3,
            AlertLevel.HIGH: 7,
            AlertLevel.CRITICAL: 15
        }
        
        total_score = sum(weights[d.alert_level] * d.confidence for d in detections)
        max_possible = len(detections) * weights[AlertLevel.CRITICAL]
        
        return min(1.0, total_score / max_possible) if max_possible > 0 else 0.0
    
    def _get_risk_level(self, risk_score: float) -> str:
        """Convert risk score to risk level"""
        if risk_score < 0.2:
            return "low"
        elif risk_score < 0.5:
            return "medium"
        elif risk_score < 0.8:
            return "high"
        else:
            return "critical"

def demo_cv_monitoring():
    """Demo function to test CV Monitoring module"""
    print("=== Computer Vision Monitoring Demo ===")
    
    # Initialize monitoring system
    cv_monitor = CVMonitoringSystem()
    
    print("Initializing CV models...")
    # Note: In real demo, models would be loaded
    print("Models initialized (simulated)")
    
    # Simulate frame analysis
    print("\nSimulating frame analysis...")
    
    # Create mock frame
    mock_frame = np.zeros((480, 640, 3), dtype=np.uint8)
    
    # Simulate various scenarios
    scenarios = [
        "Normal interview - single face detected",
        "Multiple faces detected - potential help",
        "Phone detected in frame",
        "Candidate looking away",
        "Excessive movement detected"
    ]
    
    for i, scenario in enumerate(scenarios):
        print(f"\n{i+1}. {scenario}")
        
        # Simulate detection results
        timestamp = time.time() + i
        
        if "Multiple faces" in scenario:
            result = DetectionResult(
                timestamp=timestamp,
                alert_level=AlertLevel.CRITICAL,
                detection_type="multiple_faces",
                confidence=0.95,
                details={
                    "message": "Multiple faces detected: 2",
                    "face_count": 2,
                    "duration": 15
                }
            )
        elif "Phone detected" in scenario:
            result = DetectionResult(
                timestamp=timestamp,
                alert_level=AlertLevel.CRITICAL,
                detection_type="object_detection_cell_phone",
                confidence=0.87,
                details={
                    "message": "Detected cell phone",
                    "object_class": "cell phone",
                    "detection_count": 8
                }
            )
        elif "looking away" in scenario:
            result = DetectionResult(
                timestamp=timestamp,
                alert_level=AlertLevel.MEDIUM,
                detection_type="gaze_deviation",
                confidence=0.73,
                details={
                    "message": "Looking away from camera",
                    "gaze_direction": "right",
                    "deviation": 0.45
                }
            )
        elif "movement" in scenario:
            result = DetectionResult(
                timestamp=timestamp,
                alert_level=AlertLevel.LOW,
                detection_type="excessive_movement",
                confidence=0.62,
                details={
                    "message": "Excessive movement detected",
                    "movement_score": 35.2
                }
            )
        else:
            result = DetectionResult(
                timestamp=timestamp,
                alert_level=AlertLevel.LOW,
                detection_type="normal_operation",
                confidence=0.99,
                details={"message": "Normal interview behavior"}
            )
        
        # Add to history
        cv_monitor.detection_history.append(result)
        
        print(f"   Alert Level: {result.alert_level.value}")
        print(f"   Confidence: {result.confidence:.2f}")
        print(f"   Details: {result.details['message']}")
    
    # Generate monitoring summary
    print("\n=== Monitoring Summary ===")
    summary = cv_monitor.get_monitoring_summary(time_window=300)
    
    print(f"Total detections: {summary['total_detections']}")
    print(f"Risk score: {summary['risk_score']:.2f}")
    print(f"Risk level: {summary['risk_level']}")
    
    print("\nDetection breakdown:")
    for detection_type, count in summary['detection_counts'].items():
        print(f"  {detection_type}: {count}")
    
    print("\nAlert level breakdown:")
    for level, count in summary['alert_level_counts'].items():
        print(f"  {level}: {count}")
    
    return summary

if __name__ == "__main__":
    demo_cv_monitoring()