"""
Test script for gaze detection
Run this to verify MediaPipe facial recognition and gaze tracking are working
"""
import cv2
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from ai_models.modules.cv_monitoring import CVMonitoringSystem

def test_gaze_detection():
    """Test gaze detection with webcam"""
    print("=" * 60)
    print("GAZE DETECTION TEST")
    print("=" * 60)
    
    # Initialize monitoring system
    print("\n1. Initializing CV Monitoring System...")
    monitor = CVMonitoringSystem(strict_mode=True)  # STRICT MODE for proctoring
    
    if not monitor.initialize_models():
        print("❌ Failed to initialize models!")
        return
    
    print("✅ Models initialized successfully!")
    print(f"\nConfiguration:")
    print(f"  - Gaze deviation threshold: {monitor.config['gaze_deviation_threshold']}")
    print(f"  - Extreme gaze threshold: {monitor.config['extreme_gaze_threshold']}")
    print(f"  - Consecutive frames needed: {monitor.config['gaze_consecutive_frames']}")
    
    # Open webcam
    print("\n2. Opening webcam...")
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("❌ Cannot open webcam!")
        return
    
    print("✅ Webcam opened!")
    print("\n" + "=" * 60)
    print("INSTRUCTIONS:")
    print("  - Look at the camera (center) - Should be OK")
    print("  - Look left/right at monitor - Should trigger WARNING after 3 seconds")
    print("  - Look far away - Should trigger CRITICAL immediately")
    print("  - Look down (phone/notes) - Should trigger WARNING")
    print("  - Press 'q' to quit")
    print("=" * 60 + "\n")
    
    frame_count = 0
    detection_count = 0
    
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("❌ Failed to read frame")
                break
            
            frame_count += 1
            
            # Analyze every 10 frames (simulate 3fps monitoring)
            if frame_count % 10 == 0:
                results = monitor.analyze_frame(frame)
                
                # Display results
                for result in results:
                    if result.detection_type == "gaze_deviation":
                        detection_count += 1
                        print(f"\n⚠️  ALERT #{detection_count} - {result.alert_level.value.upper()}")
                        print(f"   Message: {result.details['message']}")
                        print(f"   Direction: {result.details['gaze_direction']}")
                        print(f"   Deviation: {result.details['deviation']:.3f}")
                        print(f"   Head Pose: {result.details['head_pose']}")
                        print(f"   Count: {result.details['count']} frames")
                        print(f"   Extreme: {result.details.get('is_extreme', False)}")
            
            # Display frame with info
            cv2.putText(frame, f"Frame: {frame_count}", (10, 30), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            cv2.putText(frame, f"Detections: {detection_count}", (10, 60), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            cv2.putText(frame, f"Gaze Count: {monitor.gaze_deviation_count}", (10, 90), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
            cv2.putText(frame, f"Mode: {'STRICT' if monitor.strict_mode else 'LENIENT'}", (10, 120), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 255), 2)
            
            cv2.imshow('Gaze Detection Test - Press Q to quit, S to toggle strict mode', frame)
            
            # Handle key press
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            elif key == ord('s'):
                monitor.strict_mode = not monitor.strict_mode
                # Reinitialize config
                if monitor.strict_mode:
                    monitor.config["gaze_deviation_threshold"] = 0.35
                    monitor.config["gaze_consecutive_frames"] = 10
                    monitor.config["extreme_gaze_threshold"] = 0.6
                else:
                    monitor.config["gaze_deviation_threshold"] = 0.45
                    monitor.config["gaze_consecutive_frames"] = 15
                    monitor.config["extreme_gaze_threshold"] = 0.7
                print(f"\n🔄 Switched to {'STRICT' if monitor.strict_mode else 'LENIENT'} mode")
                print(f"   Threshold: {monitor.config['gaze_deviation_threshold']}")
    
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
    
    finally:
        cap.release()
        cv2.destroyAllWindows()
        
        print("\n" + "=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        print(f"Total frames processed: {frame_count}")
        print(f"Total gaze detections: {detection_count}")
        print(f"Detection rate: {(detection_count/max(frame_count//10, 1)*100):.1f}%")
        print("\n✅ Test completed successfully!")

if __name__ == "__main__":
    test_gaze_detection()
