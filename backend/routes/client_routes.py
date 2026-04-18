"""
Client Routes — Dashboard, profile, sub-accounts, preferences,
exports (PDF / CSV / ZIP), branding, must-ask questions.
All endpoints require JWT with role = 'interviewer' and a linked Client row.
"""
import os
import io
import csv
import uuid
import zipfile
import logging
from datetime import datetime, date, timedelta
from functools import wraps

from flask import Blueprint, request, jsonify, send_file, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from sqlalchemy import func, text

from models.models import (
    db, User, Client, ClientSubAccount, ClientPreferences, MustAskQuestion,
    Job, Interview, Question, Response, CandidateApplication, CandidateReport,
    Payment,
)

logger = logging.getLogger(__name__)

client_bp = Blueprint('client_portal', __name__, url_prefix='/api/client')

ALLOWED_IMAGE_EXT = {'png', 'jpg', 'jpeg', 'webp', 'svg'}
MAX_LOGO_SIZE = 2 * 1024 * 1024  # 2 MB


# ─── helper: resolve client from JWT ──────────────────────
def _client_required(fn):
    """JWT + must be linked to a Client row (owner or sub-account)."""
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        uid = int(get_jwt_identity())
        user = User.query.get(uid)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Owner path
        client = Client.query.filter_by(user_id=uid).first()
        is_owner = client is not None

        # Sub-account path
        if not client:
            sub = ClientSubAccount.query.filter_by(user_id=uid, is_active=True).first()
            if sub:
                client = Client.query.get(sub.client_id)

        if not client:
            return jsonify({'error': 'No client account linked to this user'}), 403
        if client.status != 'active':
            return jsonify({'error': 'Client account is not active'}), 403

        return fn(user, client, is_owner, *args, **kwargs)

    return wrapper


# ═══════════════════════════════════════════════════════════
# 1. DASHBOARD
# ═══════════════════════════════════════════════════════════

@client_bp.route('/dashboard', methods=['GET'])
@_client_required
def client_dashboard(user, client, is_owner):
    """Client dashboard — usage, subscription info, quota, upcoming deletions."""
    # Count interviews used by all users under this client
    client_user_ids = [client.user_id] + [
        sa.user_id for sa in ClientSubAccount.query.filter_by(client_id=client.id, is_active=True).all()
    ]
    completed_count = db.session.execute(text(
        "SELECT COUNT(*) FROM interviews i JOIN jobs j ON i.job_id = j.id "
        "WHERE j.created_by IN :uids AND i.status = 'completed'"
    ), {'uids': tuple(client_user_ids) if len(client_user_ids) > 1 else (client_user_ids[0], 0)}).scalar() or 0

    # Update interviews_used
    client.interviews_used = completed_count
    db.session.commit()

    quota_pct = (client.interviews_used / client.interview_quota * 100) if client.interview_quota > 0 else 0

    # Days until quota reset
    days_until_reset = None
    if client.quota_reset_date:
        delta = client.quota_reset_date - date.today()
        days_until_reset = max(delta.days, 0)

    # Days until subscription ends
    days_until_end = None
    if client.subscription_end:
        delta = client.subscription_end - date.today()
        days_until_end = max(delta.days, 0)

    # Data deletion warnings (interviews completed > retention days ago)
    prefs = ClientPreferences.query.filter_by(client_id=client.id).first()
    retention = prefs.data_retention_days if prefs else 90
    cutoff = datetime.utcnow() - timedelta(days=retention - 7)  # warn 7 days before
    expiring = db.session.execute(text(
        "SELECT i.id, i.candidate_name, i.completed_at, j.title "
        "FROM interviews i JOIN jobs j ON i.job_id = j.id "
        "WHERE j.created_by IN :uids AND i.status = 'completed' "
        "AND i.completed_at IS NOT NULL AND i.completed_at <= :cutoff "
        "ORDER BY i.completed_at ASC LIMIT 20"
    ), {'uids': tuple(client_user_ids) if len(client_user_ids) > 1 else (client_user_ids[0], 0),
        'cutoff': cutoff}).fetchall()

    expiring_list = [{
        'interview_id': r[0], 'candidate_name': r[1],
        'completed_at': r[2].isoformat() if r[2] else None,
        'job_title': r[3],
    } for r in expiring]

    # Total jobs
    total_jobs = Job.query.filter(Job.created_by.in_(client_user_ids)).count()
    active_jobs = Job.query.filter(Job.created_by.in_(client_user_ids), Job.status == 'active').count()

    # Sub accounts
    sub_accounts = [sa.to_dict() for sa in client.sub_accounts] if is_owner else []

    return jsonify({
        'client': client.to_dict(),
        'usage': {
            'interviews_used': client.interviews_used,
            'interview_quota': client.interview_quota,
            'interviews_remaining': client.interview_quota - client.interviews_used,
            'usage_pct': round(quota_pct, 1),
            'quota_warning': quota_pct >= 80,
        },
        'subscription': {
            'tier': client.tier,
            'start': client.subscription_start.isoformat() if client.subscription_start else None,
            'end': client.subscription_end.isoformat() if client.subscription_end else None,
            'days_remaining': days_until_end,
            'quota_reset_date': client.quota_reset_date.isoformat() if client.quota_reset_date else None,
            'days_until_reset': days_until_reset,
        },
        'jobs': {'total': total_jobs, 'active': active_jobs},
        'data_expiring': expiring_list,
        'sub_accounts': sub_accounts,
        'is_owner': is_owner,
    }), 200


# ═══════════════════════════════════════════════════════════
# 2. PROFILE & PASSWORD
# ═══════════════════════════════════════════════════════════

@client_bp.route('/profile', methods=['GET'])
@_client_required
def get_profile(user, client, is_owner):
    return jsonify({
        'user': user.to_dict(),
        'client': client.to_dict(),
        'is_owner': is_owner,
    }), 200


@client_bp.route('/profile', methods=['PUT'])
@_client_required
def update_profile(user, client, is_owner):
    data = request.get_json() or {}
    if 'full_name' in data:
        user.full_name = data['full_name'][:150]
    if 'phone' in data:
        user.phone = data['phone'][:20]
    if 'company_name' in data and is_owner:
        client.company_name = data['company_name'][:200]
    db.session.commit()
    return jsonify({'success': True, 'user': user.to_dict()}), 200


@client_bp.route('/change-password', methods=['POST'])
@_client_required
def change_password(user, client, is_owner):
    data = request.get_json() or {}
    current_pw = data.get('current_password', '')
    new_pw = data.get('new_password', '')
    if not user.check_password(current_pw):
        return jsonify({'error': 'Current password is incorrect'}), 400
    if len(new_pw) < 8:
        return jsonify({'error': 'New password must be at least 8 characters'}), 400
    user.set_password(new_pw)
    db.session.commit()
    return jsonify({'success': True}), 200


# ═══════════════════════════════════════════════════════════
# 3. SUB-ACCOUNTS (team members)
# ═══════════════════════════════════════════════════════════

@client_bp.route('/sub-accounts', methods=['GET'])
@_client_required
def list_sub_accounts(user, client, is_owner):
    if not is_owner:
        return jsonify({'error': 'Only the account owner can manage team members'}), 403
    accounts = ClientSubAccount.query.filter_by(client_id=client.id).all()
    return jsonify({'sub_accounts': [a.to_dict() for a in accounts]}), 200


@client_bp.route('/sub-accounts', methods=['POST'])
@_client_required
def create_sub_account(user, client, is_owner):
    if not is_owner:
        return jsonify({'error': 'Only the account owner can add team members'}), 403

    # Check sub-account limit
    current_count = ClientSubAccount.query.filter_by(client_id=client.id, is_active=True).count()
    if current_count >= client.max_sub_accounts:
        return jsonify({'error': f'Maximum {client.max_sub_accounts} sub-accounts allowed on your plan'}), 400

    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    full_name = (data.get('full_name') or '').strip()
    role = data.get('role', 'member')

    if not email or '@' not in email:
        return jsonify({'error': 'Valid email required'}), 400
    if not full_name:
        return jsonify({'error': 'Full name required'}), 400

    # Check duplicate email
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        # Check if already a sub-account of this client
        existing_sub = ClientSubAccount.query.filter_by(client_id=client.id, user_id=existing_user.id).first()
        if existing_sub:
            return jsonify({'error': 'This user is already a team member'}), 409
        # Link existing user
        sub = ClientSubAccount(client_id=client.id, user_id=existing_user.id, role=role)
        db.session.add(sub)
        db.session.commit()
        return jsonify({'success': True, 'sub_account': sub.to_dict()}), 201

    # Create new user
    username = email.split('@')[0] + '_' + uuid.uuid4().hex[:4]
    temp_password = uuid.uuid4().hex[:12]
    new_user = User(
        username=username, email=email, role='interviewer',
        full_name=full_name, is_active=True, created_by=user.id,
    )
    new_user.set_password(temp_password)
    db.session.add(new_user)
    db.session.flush()

    sub = ClientSubAccount(client_id=client.id, user_id=new_user.id, role=role)
    db.session.add(sub)
    db.session.commit()

    return jsonify({
        'success': True,
        'sub_account': sub.to_dict(),
        'credentials': {'username': username, 'temporary_password': temp_password},
    }), 201


@client_bp.route('/sub-accounts/<int:sub_id>', methods=['DELETE'])
@_client_required
def remove_sub_account(user, client, is_owner, sub_id):
    if not is_owner:
        return jsonify({'error': 'Only the account owner can remove team members'}), 403
    sub = ClientSubAccount.query.filter_by(id=sub_id, client_id=client.id).first()
    if not sub:
        return jsonify({'error': 'Sub-account not found'}), 404
    sub.is_active = False
    sub_user = User.query.get(sub.user_id)
    if sub_user:
        sub_user.is_active = False
    db.session.commit()
    return jsonify({'success': True}), 200


# ═══════════════════════════════════════════════════════════
# 4. PREFERENCES
# ═══════════════════════════════════════════════════════════

@client_bp.route('/preferences', methods=['GET'])
@_client_required
def get_preferences(user, client, is_owner):
    prefs = ClientPreferences.query.filter_by(client_id=client.id).first()
    if not prefs:
        prefs = ClientPreferences(client_id=client.id)
        db.session.add(prefs)
        db.session.commit()
    return jsonify({'preferences': prefs.to_dict()}), 200


@client_bp.route('/preferences', methods=['PUT'])
@_client_required
def update_preferences(user, client, is_owner):
    prefs = ClientPreferences.query.filter_by(client_id=client.id).first()
    if not prefs:
        prefs = ClientPreferences(client_id=client.id)
        db.session.add(prefs)

    data = request.get_json() or {}
    if 'notify_quota_80' in data:
        prefs.notify_quota_80 = bool(data['notify_quota_80'])
    if 'notify_data_deletion' in data:
        prefs.notify_data_deletion = bool(data['notify_data_deletion'])
    if 'notify_interview_complete' in data:
        prefs.notify_interview_complete = bool(data['notify_interview_complete'])
    if 'data_retention_days' in data:
        prefs.data_retention_days = max(7, min(365, int(data['data_retention_days'])))

    db.session.commit()
    return jsonify({'success': True, 'preferences': prefs.to_dict()}), 200


# ═══════════════════════════════════════════════════════════
# 5. BRANDING (logo upload)
# ═══════════════════════════════════════════════════════════

@client_bp.route('/branding', methods=['PUT'])
@_client_required
def update_branding(user, client, is_owner):
    if not is_owner:
        return jsonify({'error': 'Only account owner can update branding'}), 403

    if 'logo' not in request.files:
        return jsonify({'error': 'No logo file provided'}), 400

    logo_file = request.files['logo']
    if not logo_file.filename:
        return jsonify({'error': 'No file selected'}), 400

    ext = logo_file.filename.rsplit('.', 1)[-1].lower() if '.' in logo_file.filename else ''
    if ext not in ALLOWED_IMAGE_EXT:
        return jsonify({'error': f'Allowed image types: {", ".join(ALLOWED_IMAGE_EXT)}'}), 400

    # Size check
    logo_file.seek(0, 2)
    size = logo_file.tell()
    logo_file.seek(0)
    if size > MAX_LOGO_SIZE:
        return jsonify({'error': 'Logo must be under 2 MB'}), 400

    # Save
    upload_dir = os.path.join(current_app.root_path, '..', 'uploads', 'logos')
    os.makedirs(upload_dir, exist_ok=True)
    filename = f"client_{client.id}_{uuid.uuid4().hex[:8]}.{ext}"
    filepath = os.path.join(upload_dir, secure_filename(filename))
    logo_file.save(filepath)

    client.logo_url = f"/uploads/logos/{filename}"
    db.session.commit()
    return jsonify({'success': True, 'logo_url': client.logo_url}), 200


# ═══════════════════════════════════════════════════════════
# 6. MUST-ASK QUESTIONS
# ═══════════════════════════════════════════════════════════

@client_bp.route('/must-ask-questions', methods=['GET'])
@_client_required
def list_must_ask(user, client, is_owner):
    job_id = request.args.get('job_id', type=int)
    q = MustAskQuestion.query.filter_by(client_id=client.id, is_active=True)
    if job_id:
        q = q.filter((MustAskQuestion.job_id == job_id) | (MustAskQuestion.job_id == None))
    qs = q.order_by(MustAskQuestion.order_index).all()
    return jsonify({'questions': [qq.to_dict() for qq in qs]}), 200


@client_bp.route('/must-ask-questions', methods=['POST'])
@_client_required
def add_must_ask(user, client, is_owner):
    data = request.get_json() or {}
    question_text = (data.get('question_text') or '').strip()
    if not question_text:
        return jsonify({'error': 'Question text is required'}), 400

    mq = MustAskQuestion(
        client_id=client.id,
        job_id=data.get('job_id'),
        question_text=question_text,
        order_index=data.get('order_index', 0),
    )
    db.session.add(mq)
    db.session.commit()
    return jsonify({'success': True, 'question': mq.to_dict()}), 201


@client_bp.route('/must-ask-questions/<int:q_id>', methods=['DELETE'])
@_client_required
def delete_must_ask(user, client, is_owner, q_id):
    mq = MustAskQuestion.query.filter_by(id=q_id, client_id=client.id).first()
    if not mq:
        return jsonify({'error': 'Question not found'}), 404
    mq.is_active = False
    db.session.commit()
    return jsonify({'success': True}), 200


# ═══════════════════════════════════════════════════════════
# 7. EXPORT — Single candidate PDF
# ═══════════════════════════════════════════════════════════

def _build_candidate_pdf(interview):
    """Generate a candidate report PDF using reportlab."""
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        from reportlab.lib.units import mm
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    except ImportError:
        return None  # reportlab not installed

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=20*mm, bottomMargin=20*mm)
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('Title2', parent=styles['Title'], fontSize=18, spaceAfter=12)
    heading_style = ParagraphStyle('Heading3', parent=styles['Heading2'], fontSize=13, spaceAfter=6)
    body_style = styles['BodyText']

    elements = []

    # Header
    elements.append(Paragraph(f"Candidate Report — {interview.candidate_name}", title_style))
    elements.append(Paragraph(f"Interview #{interview.id}  |  Job: {interview.job.title if interview.job else 'N/A'}", body_style))
    elements.append(Paragraph(f"Date: {interview.completed_at.strftime('%Y-%m-%d %H:%M') if interview.completed_at else 'N/A'}", body_style))
    elements.append(Spacer(1, 8*mm))

    # Overall score
    score = interview.final_score or 0
    elements.append(Paragraph(f"Overall Score: {score}/100", heading_style))
    elements.append(Spacer(1, 4*mm))

    # AI Analysis summary
    ai = interview.ai_analysis or {}
    if ai.get('recommendation'):
        elements.append(Paragraph(f"Recommendation: {ai['recommendation']}", body_style))
    elements.append(Spacer(1, 4*mm))

    # Questions & Answers
    elements.append(Paragraph("Questions & Responses", heading_style))
    for resp in interview.responses:
        q_text = resp.question.question if resp.question else 'N/A'
        a_text = resp.answer_text or 'No answer'
        elements.append(Paragraph(f"<b>Q:</b> {q_text}", body_style))
        elements.append(Paragraph(f"<b>A:</b> {a_text}", body_style))
        scores_line = []
        if resp.relevance_score is not None:
            scores_line.append(f"Relevance: {resp.relevance_score}")
        if resp.technical_score is not None:
            scores_line.append(f"Technical: {resp.technical_score}")
        if resp.communication_score is not None:
            scores_line.append(f"Communication: {resp.communication_score}")
        if scores_line:
            elements.append(Paragraph(f"<i>{' | '.join(scores_line)}</i>", body_style))
        if resp.ai_feedback:
            elements.append(Paragraph(f"<i>Feedback: {resp.ai_feedback}</i>", body_style))
        elements.append(Spacer(1, 3*mm))

    # Proctoring
    cv_report = interview.cv_monitoring_report or {}
    if cv_report:
        elements.append(Paragraph("Proctoring Summary", heading_style))
        gaze_alerts = cv_report.get('total_alerts', 0)
        elements.append(Paragraph(f"Gaze alerts: {gaze_alerts}", body_style))
        if cv_report.get('summary'):
            elements.append(Paragraph(f"Summary: {cv_report['summary']}", body_style))
    elements.append(Spacer(1, 4*mm))

    # Candidate report (DeepSeek generated)
    report_obj = CandidateReport.query.filter_by(interview_id=interview.id).first()
    if report_obj and report_obj.report_data:
        rd = report_obj.report_data
        if rd.get('voice_analysis'):
            elements.append(Paragraph("Voice & Speech Analysis", heading_style))
            elements.append(Paragraph(str(rd['voice_analysis'])[:500], body_style))
        if rd.get('proctoring_summary'):
            elements.append(Paragraph("Proctoring Summary (AI)", heading_style))
            elements.append(Paragraph(str(rd['proctoring_summary'])[:500], body_style))

    doc.build(elements)
    buffer.seek(0)
    return buffer


@client_bp.route('/export/candidate/<int:interview_id>/pdf', methods=['GET'])
@_client_required
def export_candidate_pdf(user, client, is_owner, interview_id):
    """Export a single candidate's report as PDF."""
    interview = Interview.query.get(interview_id)
    if not interview:
        return jsonify({'error': 'Interview not found'}), 404

    # Verify ownership
    job = Job.query.get(interview.job_id)
    client_user_ids = [client.user_id] + [
        sa.user_id for sa in ClientSubAccount.query.filter_by(client_id=client.id, is_active=True).all()
    ]
    if not job or job.created_by not in client_user_ids:
        return jsonify({'error': 'Access denied'}), 403

    pdf_buf = _build_candidate_pdf(interview)
    if pdf_buf is None:
        return jsonify({'error': 'PDF generation not available (install reportlab)'}), 500

    safe_name = (interview.candidate_name or 'candidate').replace(' ', '_')
    return send_file(pdf_buf, mimetype='application/pdf', as_attachment=True,
                     download_name=f"report_{safe_name}_{interview.id}.pdf")


# ═══════════════════════════════════════════════════════════
# 8. EXPORT — Bulk CSV
# ═══════════════════════════════════════════════════════════

@client_bp.route('/export/candidates/<int:job_id>/csv', methods=['GET'])
@_client_required
def export_candidates_csv(user, client, is_owner, job_id):
    """Export all candidate summaries for a job as CSV."""
    job = Job.query.get(job_id)
    client_user_ids = [client.user_id] + [
        sa.user_id for sa in ClientSubAccount.query.filter_by(client_id=client.id, is_active=True).all()
    ]
    if not job or job.created_by not in client_user_ids:
        return jsonify({'error': 'Access denied'}), 403

    interviews = Interview.query.filter_by(job_id=job_id).order_by(Interview.final_score.desc().nullslast()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Candidate Name', 'Email', 'Status', 'Score', 'Interview Date',
                      'Duration (min)', 'Gaze Alerts', 'Recommendation'])
    for iv in interviews:
        dur = None
        if iv.started_at and iv.completed_at:
            dur = round((iv.completed_at - iv.started_at).total_seconds() / 60, 1)
        cv_alerts = (iv.cv_monitoring_report or {}).get('total_alerts', 0)
        ai = iv.ai_analysis or {}
        writer.writerow([
            iv.candidate_name, iv.candidate_email, iv.status,
            iv.final_score, iv.completed_at.isoformat() if iv.completed_at else '',
            dur, cv_alerts, ai.get('recommendation', ''),
        ])

    output.seek(0)
    buf = io.BytesIO(output.getvalue().encode('utf-8'))
    return send_file(buf, mimetype='text/csv', as_attachment=True,
                     download_name=f"candidates_{job.title.replace(' ','_')}_{job_id}.csv")


# ═══════════════════════════════════════════════════════════
# 9. EXPORT — Bulk ZIP (individual PDFs)
# ═══════════════════════════════════════════════════════════

@client_bp.route('/export/candidates/<int:job_id>/zip', methods=['GET'])
@_client_required
def export_candidates_zip(user, client, is_owner, job_id):
    """Export individual PDFs for all candidates zipped."""
    job = Job.query.get(job_id)
    client_user_ids = [client.user_id] + [
        sa.user_id for sa in ClientSubAccount.query.filter_by(client_id=client.id, is_active=True).all()
    ]
    if not job or job.created_by not in client_user_ids:
        return jsonify({'error': 'Access denied'}), 403

    interviews = Interview.query.filter_by(job_id=job_id, status='completed').all()
    if not interviews:
        return jsonify({'error': 'No completed interviews to export'}), 404

    zip_buf = io.BytesIO()
    with zipfile.ZipFile(zip_buf, 'w', zipfile.ZIP_DEFLATED) as zf:
        for iv in interviews:
            pdf = _build_candidate_pdf(iv)
            if pdf:
                safe_name = (iv.candidate_name or 'candidate').replace(' ', '_')
                zf.writestr(f"report_{safe_name}_{iv.id}.pdf", pdf.getvalue())

    zip_buf.seek(0)
    return send_file(zip_buf, mimetype='application/zip', as_attachment=True,
                     download_name=f"reports_{job.title.replace(' ','_')}_{job_id}.zip")


# ═══════════════════════════════════════════════════════════
# 10. EXPORT — Usage report CSV
# ═══════════════════════════════════════════════════════════

@client_bp.route('/export/usage', methods=['GET'])
@_client_required
def export_usage_csv(user, client, is_owner):
    """Export a usage report CSV across all jobs."""
    client_user_ids = [client.user_id] + [
        sa.user_id for sa in ClientSubAccount.query.filter_by(client_id=client.id, is_active=True).all()
    ]

    rows = db.session.execute(text(
        "SELECT i.candidate_name, j.title, i.status, i.final_score, "
        "i.started_at, i.completed_at "
        "FROM interviews i JOIN jobs j ON i.job_id = j.id "
        "WHERE j.created_by IN :uids ORDER BY i.created_at DESC"
    ), {'uids': tuple(client_user_ids) if len(client_user_ids) > 1 else (client_user_ids[0], 0)}).fetchall()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Candidate Name', 'Job Title', 'Status', 'Score',
                      'Started At', 'Completed At', 'Duration (min)'])
    for r in rows:
        dur = None
        if r[4] and r[5]:
            dur = round((r[5] - r[4]).total_seconds() / 60, 1)
        writer.writerow([r[0], r[1], r[2], r[3],
                         r[4].isoformat() if r[4] else '',
                         r[5].isoformat() if r[5] else '', dur])

    output.seek(0)
    buf = io.BytesIO(output.getvalue().encode('utf-8'))
    return send_file(buf, mimetype='text/csv', as_attachment=True,
                     download_name=f"usage_report_{client.company_name.replace(' ','_')}.csv")


# ═══════════════════════════════════════════════════════════
# 11. JOBS — list client's jobs
# ═══════════════════════════════════════════════════════════

@client_bp.route('/jobs', methods=['GET'])
@_client_required
def list_jobs(user, client, is_owner):
    client_user_ids = [client.user_id] + [
        sa.user_id for sa in ClientSubAccount.query.filter_by(client_id=client.id, is_active=True).all()
    ]
    jobs = Job.query.filter(Job.created_by.in_(client_user_ids)).order_by(Job.created_at.desc()).all()
    return jsonify({'jobs': [j.to_dict() for j in jobs]}), 200


# ═══════════════════════════════════════════════════════════
# 12. CANDIDATES (per job)
# ═══════════════════════════════════════════════════════════

@client_bp.route('/jobs/<int:job_id>/candidates', methods=['GET'])
@_client_required
def list_candidates(user, client, is_owner, job_id):
    job = Job.query.get(job_id)
    client_user_ids = [client.user_id] + [
        sa.user_id for sa in ClientSubAccount.query.filter_by(client_id=client.id, is_active=True).all()
    ]
    if not job or job.created_by not in client_user_ids:
        return jsonify({'error': 'Access denied'}), 403

    interviews = Interview.query.filter_by(job_id=job_id).order_by(
        Interview.final_score.desc().nullslast()
    ).all()

    return jsonify({'candidates': [iv.to_dict() for iv in interviews]}), 200
