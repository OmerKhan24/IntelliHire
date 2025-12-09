#!/bin/bash
# Installation script for CV Monitoring dependencies

echo "Installing CV Monitoring Dependencies..."
echo "This may take a few minutes as packages are large (~100MB total)"
echo ""

# Core CV libraries
pip install opencv-python==4.8.1.78
pip install mediapipe==0.10.8

# Async HTTP for frame analysis
pip install aiohttp==3.9.1

# YOLO for object detection (optional - will auto-install on first use)
pip install ultralytics==8.0.200

echo ""
echo "✅ Installation complete!"
echo ""
echo "Note: YOLO model (yolov8n.pt) will be downloaded automatically on first use (~6MB)"
echo ""
echo "To test the CV monitoring module:"
echo "  cd ai_models/modules"
echo "  python cv_monitoring.py"
