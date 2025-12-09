# Installation script for CV Monitoring dependencies (Windows)

Write-Host "Installing CV Monitoring Dependencies..." -ForegroundColor Green
Write-Host "This may take a few minutes as packages are large (~100MB total)" -ForegroundColor Yellow
Write-Host ""

# Core CV libraries
Write-Host "Installing OpenCV..." -ForegroundColor Cyan
pip install opencv-python==4.8.1.78

Write-Host "Installing MediaPipe..." -ForegroundColor Cyan
pip install mediapipe==0.10.8

# Async HTTP for frame analysis
Write-Host "Installing aiohttp..." -ForegroundColor Cyan
pip install aiohttp==3.9.1

# YOLO for object detection (optional - will auto-install on first use)
Write-Host "Installing YOLO (Ultralytics)..." -ForegroundColor Cyan
pip install ultralytics==8.0.200

Write-Host ""
Write-Host "✅ Installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Note: YOLO model (yolov8n.pt) will be downloaded automatically on first use (~6MB)" -ForegroundColor Yellow
Write-Host ""
Write-Host "To test the CV monitoring module:" -ForegroundColor Cyan
Write-Host "  cd ai_models/modules"
Write-Host "  python cv_monitoring.py"
