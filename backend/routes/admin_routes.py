"""
Admin Routes — Leads, Clients, Payments, Health, API Status,
Audit Logs, Announcements, Settings, SOS Controls
"""
import os
import re
import uuid
import psutil
import logging
import requests
from datetime import datetime
from flask import Blueprint, request, jsonify
import functools
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.models import (
    db, User, Lead, Client, Payment, Refund,
    AuditLog, Announcement, SystemSetting, Interview
)
from services.email_service import EmailService

logger = logging.getLogger(__name__)

admin_bp = Blueprint('admin_panel', __name__, url_prefix='/api/admin')

email_service = EmailService(
    mailtrap_token=os.environ.get('MAILTRAP_API_TOKEN', ''),
)

# ─── helpers ──────────────────────────────────────────────
def _admin_required(fn):
    """Decorator: JWT + admin role check"""
    @functools.wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        uid = get_jwt_identity()
        user = User.query.get(int(uid))
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return fn(user, *args, **kwargs)
    return wrapper


def _log_action(admin_user, action, entity_type=None, entity_id=None, details=None):
    """Write an audit-log row."""
    log = AuditLog(
        user_id=admin_user.id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=details,
        ip_address=request.remote_addr,
    )
    db.session.add(log)


def _get_setting(key, default='false'):
    row = SystemSetting.query.filter_by(setting_key=key).first()
    return row.setting_value if row else default


def _set_setting(key, value, admin_id=None):
    row = SystemSetting.query.filter_by(setting_key=key).first()
    if row:
        row.setting_value = str(value)
        row.updated_by = admin_id
    else:
        row = SystemSetting(setting_key=key, setting_value=str(value), updated_by=admin_id)
        db.session.add(row)


# ── field validation helpers ────────────────────────────────
_EMAIL_RE = re.compile(r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$')
_PHONE_RE = re.compile(r'^\+?[\d\s\-()]{7,20}$')
_NAME_RE  = re.compile(r'^[a-zA-Z\s\.\-\']{2,150}$')

VALID_PLANS = {'starter', 'professional', 'enterprise'}
VALID_SIZES = {'1-10', '11-50', '51-200', '201-500', '500+'}


# ═══════════════════════════════════════════════════════════
# 1. LEADS
# ═══════════════════════════════════════════════════════════

@admin_bp.route('/leads', methods=['POST'])
def create_lead():
    """Public endpoint — landing-page form submission."""
    # Check if signups paused
    if _get_setting('pause_new_signups') == 'true':
        return jsonify({'error': 'We are not accepting new signups at this time. Please try again later.'}), 503

    data = request.get_json() or {}
    errors = {}

    # --- required fields ---
    full_name = (data.get('full_name') or '').strip()
    if not full_name or not _NAME_RE.match(full_name):
        errors['full_name'] = 'Valid full name required (2-150 characters, letters only)'

    company_name = (data.get('company_name') or '').strip()
    if not company_name or len(company_name) < 2 or len(company_name) > 200:
        errors['company_name'] = 'Company name required (2-200 characters)'

    work_email = (data.get('work_email') or '').strip().lower()
    if not work_email or not _EMAIL_RE.match(work_email):
        errors['work_email'] = 'Valid work email required'

    phone = (data.get('phone') or '').strip()
    if not phone or not _PHONE_RE.match(phone):
        errors['phone'] = 'Valid phone number required (7-20 digits)'

    selected_plan = (data.get('selected_plan') or '').strip().lower()
    if selected_plan not in VALID_PLANS:
        errors['selected_plan'] = f'Plan must be one of: {", ".join(sorted(VALID_PLANS))}'

    # --- optional fields with length validation ---
    job_title = (data.get('job_title') or '').strip()
    if job_title and len(job_title) > 150:
        errors['job_title'] = 'Job title must be under 150 characters'

    company_size = (data.get('company_size') or '').strip()
    if company_size and company_size not in VALID_SIZES:
        errors['company_size'] = f'Company size must be one of: {", ".join(sorted(VALID_SIZES))}'

    industry = (data.get('industry') or '').strip()
    if industry and len(industry) > 100:
        errors['industry'] = 'Industry must be under 100 characters'

    country = (data.get('country') or '').strip()
    if country and len(country) > 100:
        errors['country'] = 'Country must be under 100 characters'

    message = (data.get('message') or '').strip()
    if message and len(message) > 2000:
        errors['message'] = 'Message must be under 2000 characters'

    if errors:
        return jsonify({'error': 'Validation failed', 'fields': errors}), 422

    # Check duplicate email
    existing = Lead.query.filter_by(work_email=work_email).filter(
        Lead.status.in_(['new', 'contacted', 'confirmed'])
    ).first()
    if existing:
        return jsonify({'error': 'A request with this email is already being processed'}), 409

    lead = Lead(
        full_name=full_name, job_title=job_title, company_name=company_name,
        company_size=company_size, industry=industry, work_email=work_email,
        phone=phone, country=country, message=message, selected_plan=selected_plan,
    )
    db.session.add(lead)
    db.session.commit()

    # Send confirmation email to the lead
    email_service.send(
        to_email=work_email, to_name=full_name,
        subject='We received your request — IntelliHire',
        html_body=email_service._base_template(f"""
            <h2>Hi {full_name},</h2>
            <p>Thank you for your interest in <strong>IntelliHire</strong>!</p>
            <p>We've received your request for the <strong>{selected_plan.capitalize()}</strong> plan.
            Our team will review your details and contact you shortly.</p>
            <p>In the meantime, feel free to reply to this email with any questions.</p>
            <p>Best regards,<br>The IntelliHire Team</p>
        """)
    )

    logger.info(f"📩 New lead created: {full_name} ({work_email}) — plan: {selected_plan}")
    return jsonify({'success': True, 'message': 'Your request has been submitted. We will contact you soon!'}), 201


@admin_bp.route('/leads', methods=['GET'])
@_admin_required
def list_leads(admin):
    """Admin — list all leads, optionally filtered by status."""
    status = request.args.get('status')
    q = Lead.query.order_by(Lead.created_at.desc())
    if status:
        q = q.filter_by(status=status)
    leads = q.all()
    return jsonify({'leads': [l.to_dict() for l in leads]}), 200


@admin_bp.route('/leads/<int:lead_id>', methods=['GET'])
@_admin_required
def get_lead(admin, lead_id):
    lead = Lead.query.get_or_404(lead_id)
    return jsonify({'lead': lead.to_dict()}), 200


@admin_bp.route('/leads/<int:lead_id>', methods=['PUT'])
@_admin_required
def update_lead(admin, lead_id):
    """Admin — update lead status / notes."""
    lead = Lead.query.get_or_404(lead_id)
    data = request.get_json() or {}

    if 'status' in data:
        lead.status = data['status']
        if data['status'] == 'contacted':
            lead.contacted_at = datetime.utcnow()
        elif data['status'] == 'confirmed':
            lead.confirmed_at = datetime.utcnow()
    if 'admin_notes' in data:
        lead.admin_notes = data['admin_notes']
    if 'selected_plan' in data and data['selected_plan'] in VALID_PLANS:
        lead.selected_plan = data['selected_plan']

    _log_action(admin, 'lead.update', 'lead', lead.id, data)
    db.session.commit()
    return jsonify({'success': True, 'lead': lead.to_dict()}), 200


@admin_bp.route('/leads/<int:lead_id>/confirm', methods=['POST'])
@_admin_required
def confirm_lead(admin, lead_id):
    """
    Admin confirms lead → system generates login credentials,
    creates a Client row, emails the client their credentials.
    """
    lead = Lead.query.get_or_404(lead_id)
    if lead.status == 'converted':
        return jsonify({'error': 'Lead already converted'}), 400

    data = request.get_json() or {}
    tier = data.get('tier', lead.selected_plan)
    quota = data.get('interview_quota', 50)
    max_sub = data.get('max_sub_accounts', 3)

    # Subscription dates
    from datetime import timedelta, date as _date
    start_str = data.get('subscription_start')
    sub_start = _date.fromisoformat(start_str) if start_str else _date.today()
    sub_end = sub_start + timedelta(days=30)
    quota_reset = sub_end

    # Plan-based defaults
    plan_defaults = {
        'starter': {'quota': 50, 'max_sub': 3},
        'professional': {'quota': 200, 'max_sub': 10},
        'enterprise': {'quota': 9999, 'max_sub': 50},
    }
    defaults = plan_defaults.get(tier, plan_defaults['starter'])
    if not data.get('interview_quota'):
        quota = defaults['quota']
    if not data.get('max_sub_accounts'):
        max_sub = defaults['max_sub']

    # Generate credentials
    username = lead.work_email.split('@')[0] + '_' + uuid.uuid4().hex[:4]
    temp_password = uuid.uuid4().hex[:12]

    # Create user account (role = 'interviewer' — the client uses interviewer features)
    user = User(
        username=username, email=lead.work_email, role='interviewer',
        full_name=lead.full_name, phone=lead.phone, is_active=True,
        created_by=admin.id,
    )
    user.set_password(temp_password)
    db.session.add(user)
    db.session.flush()  # get user.id

    # Create client record
    client = Client(
        lead_id=lead.id, user_id=user.id, company_name=lead.company_name,
        contact_name=lead.full_name, email=lead.work_email,
        tier=tier, interview_quota=quota,
        subscription_start=sub_start, subscription_end=sub_end,
        quota_reset_date=quota_reset, max_sub_accounts=max_sub,
    )
    db.session.add(client)

    lead.status = 'converted'
    lead.converted_at = datetime.utcnow()

    _log_action(admin, 'lead.confirm', 'lead', lead.id,
                {'tier': tier, 'quota': quota, 'username': username})
    db.session.commit()

    # Email credentials
    email_service.send(
        to_email=lead.work_email, to_name=lead.full_name,
        subject='Your IntelliHire Account is Ready!',
        html_body=email_service._base_template(f"""
            <h2>Welcome to IntelliHire, {lead.full_name}!</h2>
            <p>Your account has been activated on the <strong>{tier.capitalize()}</strong> plan.</p>
            <table style="width:100%;border-collapse:collapse;margin:20px 0">
              <tr><td style="padding:8px;font-weight:600;border-bottom:1px solid #e2e8f0">Username</td>
                  <td style="padding:8px;border-bottom:1px solid #e2e8f0">{username}</td></tr>
              <tr><td style="padding:8px;font-weight:600;border-bottom:1px solid #e2e8f0">Temporary Password</td>
                  <td style="padding:8px;border-bottom:1px solid #e2e8f0"><code>{temp_password}</code></td></tr>
              <tr><td style="padding:8px;font-weight:600;border-bottom:1px solid #e2e8f0">Interview Quota</td>
                  <td style="padding:8px;border-bottom:1px solid #e2e8f0">{quota} interviews</td></tr>
              <tr><td style="padding:8px;font-weight:600;border-bottom:1px solid #e2e8f0">Subscription Start</td>
                  <td style="padding:8px;border-bottom:1px solid #e2e8f0">{sub_start.strftime('%B %d, %Y')}</td></tr>
              <tr><td style="padding:8px;font-weight:600;border-bottom:1px solid #e2e8f0">Subscription End</td>
                  <td style="padding:8px;border-bottom:1px solid #e2e8f0">{sub_end.strftime('%B %d, %Y')}</td></tr>
              <tr><td style="padding:8px;font-weight:600">Team Accounts</td>
                  <td style="padding:8px">Up to {max_sub} sub-accounts</td></tr>
            </table>
            <p>Please change your password after your first login.</p>
            <p><strong>Getting Started:</strong></p>
            <ol>
              <li>Log in with your credentials above</li>
              <li>Create your first job posting</li>
              <li>Share the interview link with candidates</li>
              <li>AI will screen, interview, and rank candidates for you</li>
            </ol>
            <p style="text-align:center">
              <a href="{os.environ.get('FRONTEND_URL','http://localhost:3000')}/login"
                 class="btn" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#2f97f7,#0ea5e9);color:#fff;text-decoration:none;border-radius:8px;font-weight:600">
                Log In Now
              </a>
            </p>
        """)
    )

    logger.info(f"✅ Lead {lead.id} converted → client {client.id}, user {user.id}")
    return jsonify({
        'success': True,
        'client': client.to_dict(),
        'credentials': {'username': username, 'temporary_password': temp_password},
    }), 201


# ═══════════════════════════════════════════════════════════
# 2. CLIENTS
# ═══════════════════════════════════════════════════════════

@admin_bp.route('/clients', methods=['GET'])
@_admin_required
def list_clients(admin):
    clients = Client.query.order_by(Client.created_at.desc()).all()
    result = []
    for c in clients:
        d = c.to_dict()
        from sqlalchemy import text as _text
        count = db.session.execute(_text(
            "SELECT COUNT(*) FROM interviews i JOIN jobs j ON i.job_id=j.id "
            "WHERE j.created_by=:uid AND i.status='completed'"
        ), {'uid': c.user_id}).scalar()
        d['interviews_conducted'] = count or 0
        result.append(d)
    return jsonify({'clients': result}), 200


@admin_bp.route('/clients', methods=['POST'])
@_admin_required
def create_client_manual(admin):
    """Admin manually creates a client (not from lead)."""
    data = request.get_json() or {}
    required = ['company_name', 'contact_name', 'email']
    for f in required:
        if not data.get(f):
            return jsonify({'error': f'{f} is required'}), 400

    email = data['email'].strip().lower()
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already in use'}), 409

    tier = data.get('plan', 'starter')
    quota = int(data.get('interview_quota', 50))
    max_sub = int(data.get('max_sub_accounts', 3))

    from datetime import timedelta, date as _date
    start_str = data.get('subscription_start')
    sub_start = _date.fromisoformat(start_str) if start_str else _date.today()
    sub_end = sub_start + timedelta(days=30)

    # Create user
    username = email.split('@')[0] + '_' + uuid.uuid4().hex[:4]
    temp_password = data.get('password') or uuid.uuid4().hex[:12]
    user = User(
        username=username, email=email, role='interviewer',
        full_name=data['contact_name'], is_active=True, created_by=admin.id,
    )
    user.set_password(temp_password)
    db.session.add(user)
    db.session.flush()

    # Create a dummy lead for FK
    lead = Lead(
        full_name=data['contact_name'], company_name=data['company_name'],
        work_email=email, phone=data.get('phone', ''),
        selected_plan=tier, status='converted', converted_at=datetime.utcnow(),
    )
    db.session.add(lead)
    db.session.flush()

    client = Client(
        lead_id=lead.id, user_id=user.id, company_name=data['company_name'],
        contact_name=data['contact_name'], email=email,
        tier=tier, interview_quota=quota,
        subscription_start=sub_start, subscription_end=sub_end,
        quota_reset_date=sub_end, max_sub_accounts=max_sub,
        notes=data.get('notes', ''),
    )
    db.session.add(client)
    _log_action(admin, 'client.manual_create', 'client', None, {'email': email, 'tier': tier})
    db.session.commit()

    # Send welcome email
    email_service.send(
        to_email=email, to_name=data['contact_name'],
        subject='Welcome to IntelliHire!',
        html_body=email_service._base_template(f"""
            <h2>Welcome to IntelliHire, {data['contact_name']}!</h2>
            <p>Your account has been created on the <strong>{tier.capitalize()}</strong> plan.</p>
            <table style="width:100%;border-collapse:collapse;margin:20px 0">
              <tr><td style="padding:8px;font-weight:600;border-bottom:1px solid #e2e8f0">Username</td>
                  <td style="padding:8px;border-bottom:1px solid #e2e8f0">{username}</td></tr>
              <tr><td style="padding:8px;font-weight:600;border-bottom:1px solid #e2e8f0">Temporary Password</td>
                  <td style="padding:8px;border-bottom:1px solid #e2e8f0"><code>{temp_password}</code></td></tr>
              <tr><td style="padding:8px;font-weight:600">Quota</td>
                  <td style="padding:8px">{quota} interviews / month</td></tr>
            </table>
            <p style="text-align:center">
              <a href="{os.environ.get('FRONTEND_URL','http://localhost:3000')}/login"
                 class="btn" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#2f97f7,#0ea5e9);color:#fff;text-decoration:none;border-radius:8px;font-weight:600">
                Log In Now
              </a>
            </p>
        """)
    )

    return jsonify({
        'success': True, 'client': client.to_dict(),
        'credentials': {'username': username, 'temporary_password': temp_password},
    }), 201


@admin_bp.route('/clients/<int:client_id>', methods=['GET'])
@_admin_required
def get_client(admin, client_id):
    client = Client.query.get_or_404(client_id)
    d = client.to_dict()
    # interviews conducted
    from sqlalchemy import text
    count = db.session.execute(text(
        "SELECT COUNT(*) FROM interviews i JOIN jobs j ON i.job_id=j.id "
        "WHERE j.created_by=:uid AND i.status='completed'"
    ), {'uid': client.user_id}).scalar()
    d['interviews_conducted'] = count or 0
    return jsonify({'client': d}), 200


@admin_bp.route('/clients/<int:client_id>/quota', methods=['PUT'])
@_admin_required
def update_client_quota(admin, client_id):
    """Add to or set interview quota for a client."""
    client = Client.query.get_or_404(client_id)
    data = request.get_json() or {}

    if 'add_quota' in data:
        client.interview_quota += int(data['add_quota'])
    elif 'set_quota' in data:
        client.interview_quota = int(data['set_quota'])
    if 'tier' in data and data['tier'] in VALID_PLANS:
        client.tier = data['tier']
    if 'is_active' in data:
        client.is_active = data['is_active']
        if not data['is_active']:
            client.deactivated_at = datetime.utcnow()

    _log_action(admin, 'client.update_quota', 'client', client.id, data)
    db.session.commit()
    return jsonify({'success': True, 'client': client.to_dict()}), 200


# ═══════════════════════════════════════════════════════════
# 3. REVENUE — Payments & Refunds
# ═══════════════════════════════════════════════════════════

@admin_bp.route('/payments', methods=['GET'])
@_admin_required
def list_payments(admin):
    payments = Payment.query.order_by(Payment.created_at.desc()).all()
    total = sum(p.amount for p in payments if p.status == 'completed')
    return jsonify({'payments': [p.to_dict() for p in payments], 'total_revenue': total}), 200


@admin_bp.route('/payments', methods=['POST'])
@_admin_required
def record_payment(admin):
    """Manually record a payment (e.g. after bank confirmation)."""
    data = request.get_json() or {}
    required = ['client_id', 'amount']
    for f in required:
        if f not in data:
            return jsonify({'error': f'{f} is required'}), 400

    client = Client.query.get(data['client_id'])
    if not client:
        return jsonify({'error': 'Client not found'}), 404

    payment = Payment(
        client_id=client.id,
        amount=float(data['amount']),
        currency=data.get('currency', 'USD'),
        payment_method=data.get('payment_method', 'manual'),
        payment_ref=data.get('payment_ref', ''),
        status='completed',
        description=data.get('description', ''),
        paid_at=datetime.utcnow(),
    )
    db.session.add(payment)
    _log_action(admin, 'payment.record', 'payment', None, data)
    db.session.commit()
    return jsonify({'success': True, 'payment': payment.to_dict()}), 201


@admin_bp.route('/refunds', methods=['GET'])
@_admin_required
def list_refunds(admin):
    refunds = Refund.query.order_by(Refund.created_at.desc()).all()
    return jsonify({'refunds': [r.to_dict() for r in refunds]}), 200


@admin_bp.route('/refunds', methods=['POST'])
@_admin_required
def process_refund(admin):
    """Process a manual refund."""
    data = request.get_json() or {}
    payment = Payment.query.get(data.get('payment_id'))
    if not payment:
        return jsonify({'error': 'Payment not found'}), 404
    if payment.status == 'refunded':
        return jsonify({'error': 'Payment already refunded'}), 400

    amount = float(data.get('amount', payment.amount))
    if amount > payment.amount:
        return jsonify({'error': 'Refund amount exceeds payment amount'}), 400

    refund = Refund(
        payment_id=payment.id, client_id=payment.client_id,
        amount=amount, reason=data.get('reason', ''),
        status='processed', processed_by=admin.id,
        processed_at=datetime.utcnow(),
    )
    payment.status = 'refunded'
    db.session.add(refund)
    _log_action(admin, 'refund.process', 'refund', None, data)
    db.session.commit()
    return jsonify({'success': True, 'refund': refund.to_dict()}), 201


# ═══════════════════════════════════════════════════════════
# 4. SERVER HEALTH  (polled every 30s by frontend)
# ═══════════════════════════════════════════════════════════

@admin_bp.route('/health', methods=['GET'])
@_admin_required
def server_health(admin):
    import time
    boot = psutil.boot_time()
    uptime_secs = time.time() - boot

    cpu = psutil.cpu_percent(interval=0.5)
    mem = psutil.virtual_memory()
    disk = psutil.disk_usage('/')

    # Active interview sessions
    active = Interview.query.filter_by(status='in_progress').all()
    active_sessions = []
    for iv in active:
        from sqlalchemy import text
        client_name = None
        row = db.session.execute(text(
            "SELECT c.company_name FROM clients c "
            "JOIN users u ON u.id=c.user_id "
            "JOIN jobs j ON j.created_by=u.id "
            "WHERE j.id=:jid LIMIT 1"
        ), {'jid': iv.job_id}).first()
        if row:
            client_name = row[0]
        active_sessions.append({
            'interview_id': iv.id,
            'started_at': iv.started_at.isoformat() if iv.started_at else None,
            'client_name': client_name or 'N/A',
        })

    return jsonify({
        'server': {
            'cpu_percent': cpu,
            'ram_used': mem.used,
            'ram_total': mem.total,
            'ram_percent': mem.percent,
            'disk_used': disk.used,
            'disk_total': disk.total,
            'disk_percent': disk.percent,
            'uptime_seconds': int(uptime_secs),
        },
        'active_sessions': {
            'count': len(active_sessions),
            'sessions': active_sessions,
        },
    }), 200


# ═══════════════════════════════════════════════════════════
# 5. API STATUS — ping third-party services
# ═══════════════════════════════════════════════════════════

def _ping_api(name, url, timeout=5):
    """Quick health ping on an external API."""
    import time
    start = time.time()
    try:
        r = requests.get(url, timeout=timeout)
        elapsed = round((time.time() - start) * 1000)
        ok = r.status_code < 500
        return {
            'name': name,
            'status': 'operational' if ok else 'degraded',
            'response_time_ms': elapsed,
            'last_checked': datetime.utcnow().isoformat(),
        }
    except Exception:
        return {
            'name': name,
            'status': 'down',
            'response_time_ms': None,
            'last_checked': datetime.utcnow().isoformat(),
        }


@admin_bp.route('/api-status', methods=['GET'])
@_admin_required
def api_status(admin):
    results = [
        _ping_api('DeepSeek API', 'https://api.deepseek.com/v1/models'),
        _ping_api('Google TTS (STT)', 'https://texttospeech.googleapis.com/$discovery/rest'),
        _ping_api('Google STT', 'https://speech.googleapis.com/$discovery/rest'),
    ]
    return jsonify({'apis': results}), 200


# ═══════════════════════════════════════════════════════════
# 6. AUDIT LOGS
# ═══════════════════════════════════════════════════════════

@admin_bp.route('/audit-logs', methods=['GET'])
@_admin_required
def list_audit_logs(admin):
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    per_page = min(per_page, 200)
    q = AuditLog.query.order_by(AuditLog.created_at.desc())

    action_filter = request.args.get('action')
    if action_filter:
        q = q.filter(AuditLog.action.like(f'%{action_filter}%'))

    total = q.count()
    logs = q.offset((page - 1) * per_page).limit(per_page).all()
    return jsonify({
        'logs': [l.to_dict() for l in logs],
        'total': total, 'page': page, 'per_page': per_page,
    }), 200


# ═══════════════════════════════════════════════════════════
# 7. ANNOUNCEMENTS
# ═══════════════════════════════════════════════════════════

@admin_bp.route('/announcements', methods=['GET'])
@_admin_required
def list_announcements(admin):
    anns = Announcement.query.order_by(Announcement.created_at.desc()).all()
    return jsonify({'announcements': [a.to_dict() for a in anns]}), 200


@admin_bp.route('/announcements', methods=['POST'])
@_admin_required
def create_announcement(admin):
    data = request.get_json() or {}
    if not data.get('title') or not data.get('content'):
        return jsonify({'error': 'Title and content are required'}), 400

    ann = Announcement(
        title=data['title'], content=data['content'],
        type=data.get('type', 'info'),
        target_audience=data.get('target_audience', 'all'),
        created_by=admin.id,
        expires_at=datetime.fromisoformat(data['expires_at']) if data.get('expires_at') else None,
    )
    db.session.add(ann)
    _log_action(admin, 'announcement.create', 'announcement', None, {'title': data['title']})
    db.session.commit()
    return jsonify({'success': True, 'announcement': ann.to_dict()}), 201


@admin_bp.route('/announcements/<int:ann_id>', methods=['DELETE'])
@_admin_required
def delete_announcement(admin, ann_id):
    ann = Announcement.query.get_or_404(ann_id)
    ann.is_active = False
    _log_action(admin, 'announcement.delete', 'announcement', ann_id)
    db.session.commit()
    return jsonify({'success': True}), 200


# ═══════════════════════════════════════════════════════════
# 8. SETTINGS
# ═══════════════════════════════════════════════════════════

@admin_bp.route('/settings', methods=['GET'])
@_admin_required
def get_settings(admin):
    settings = SystemSetting.query.all()
    return jsonify({'settings': {s.setting_key: s.setting_value for s in settings}}), 200


@admin_bp.route('/settings', methods=['PUT'])
@_admin_required
def update_settings(admin):
    data = request.get_json() or {}
    for key, value in data.items():
        _set_setting(key, value, admin.id)
    _log_action(admin, 'settings.update', 'setting', None, data)
    db.session.commit()
    return jsonify({'success': True}), 200


# ═══════════════════════════════════════════════════════════
# 9. SOS CONTROLS
# ═══════════════════════════════════════════════════════════

@admin_bp.route('/sos/toggle', methods=['POST'])
@_admin_required
def sos_toggle(admin):
    """Toggle SOS settings like pause_new_interviews, pause_new_signups, maintenance_mode."""
    data = request.get_json() or {}
    key = data.get('key')
    allowed = {'pause_new_interviews', 'pause_new_signups', 'maintenance_mode'}
    if key not in allowed:
        return jsonify({'error': f'Key must be one of: {", ".join(allowed)}'}), 400
    current = _get_setting(key)
    new_val = 'false' if current == 'true' else 'true'
    _set_setting(key, new_val, admin.id)
    _log_action(admin, f'sos.{key}', 'setting', None, {'old': current, 'new': new_val})
    db.session.commit()
    logger.warning(f"🚨 SOS: {key} toggled to {new_val} by admin {admin.username}")
    return jsonify({'success': True, 'key': key, 'value': new_val}), 200


@admin_bp.route('/sos/alert-email', methods=['POST'])
@_admin_required
def sos_alert_email(admin):
    """Send system alert email to all active clients."""
    data = request.get_json() or {}
    message_body = data.get('message', '')
    subject = data.get('subject', 'System Alert — IntelliHire')
    if not message_body:
        return jsonify({'error': 'Message is required'}), 400

    clients = Client.query.filter_by(is_active=True).all()
    sent = 0
    for c in clients:
        user = User.query.get(c.user_id)
        if user and user.email:
            ok = email_service.send(
                to_email=user.email, to_name=user.full_name or c.company_name,
                subject=subject,
                html_body=email_service._base_template(f"""
                    <h2>System Alert</h2>
                    <p>{message_body}</p>
                    <p>— IntelliHire Operations Team</p>
                """)
            )
            if ok:
                sent += 1

    _log_action(admin, 'sos.alert_email', 'setting', None,
                {'subject': subject, 'sent_count': sent})
    db.session.commit()
    return jsonify({'success': True, 'sent_count': sent, 'total_clients': len(clients)}), 200


# ═══════════════════════════════════════════════════════════
# 10. DASHBOARD OVERVIEW
# ═══════════════════════════════════════════════════════════

@admin_bp.route('/dashboard', methods=['GET'])
@_admin_required
def dashboard_overview(admin):
    from sqlalchemy import func, text
    total_leads = Lead.query.count()
    new_leads = Lead.query.filter_by(status='new').count()
    total_clients = Client.query.count()
    active_clients = Client.query.filter_by(is_active=True).count()
    total_revenue = db.session.query(func.coalesce(func.sum(Payment.amount), 0)).filter(
        Payment.status == 'completed'
    ).scalar()
    total_refunds = db.session.query(func.coalesce(func.sum(Refund.amount), 0)).filter(
        Refund.status == 'processed'
    ).scalar()
    total_interviews = Interview.query.filter_by(status='completed').count()
    active_interviews = Interview.query.filter_by(status='in_progress').count()

    # Recent leads (last 5)
    recent_leads = Lead.query.order_by(Lead.created_at.desc()).limit(5).all()

    return jsonify({
        'stats': {
            'total_leads': total_leads,
            'new_leads': new_leads,
            'total_clients': total_clients,
            'active_clients': active_clients,
            'total_revenue': float(total_revenue),
            'total_refunds': float(total_refunds),
            'net_revenue': float(total_revenue - total_refunds),
            'total_interviews': total_interviews,
            'active_interviews': active_interviews,
        },
        'recent_leads': [l.to_dict() for l in recent_leads],
    }), 200


# ═══════════════════════════════════════════════════════════
# 11. PASSWORD CHANGE (for clients after first login)
# ═══════════════════════════════════════════════════════════

@admin_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Any authenticated user can change their password."""
    uid = get_jwt_identity()
    user = User.query.get(int(uid))
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json() or {}
    current_pw = data.get('current_password', '')
    new_pw = data.get('new_password', '')

    if not user.check_password(current_pw):
        return jsonify({'error': 'Current password is incorrect'}), 400
    if len(new_pw) < 8:
        return jsonify({'error': 'New password must be at least 8 characters'}), 400

    user.set_password(new_pw)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Password changed successfully'}), 200
