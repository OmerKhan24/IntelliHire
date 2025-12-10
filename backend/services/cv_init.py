"""Initialize CV monitoring environment before any imports"""
import os
import sys

# CRITICAL: Set this BEFORE any other imports
os.environ['PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION'] = 'python'

# Force protobuf 3 behavior
import google.protobuf
if hasattr(google.protobuf, '__version__'):
    version = google.protobuf.__version__
    if version.startswith('4.'):
        print(f"⚠️  Warning: Protobuf {version} detected. MediaPipe requires 3.x")