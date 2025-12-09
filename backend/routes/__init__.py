# Routes package initialization
# This file makes the routes directory a Python package

from .api_routes import (
    api_bp, 
    job_bp, 
    interview_bp, 
    report_bp, 
    monitoring_bp,
    register_blueprints, 
    init_services
)

__all__ = [
    'api_bp',
    'job_bp', 
    'interview_bp',
    'report_bp',
    'monitoring_bp',
    'register_blueprints',
    'init_services'
]
