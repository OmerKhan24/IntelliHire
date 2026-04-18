"""
Email Service — sends transactional emails via Mailtrap Sending API.
Falls back to saving HTML files in dev_emails/ when API token is absent.
"""
import os
import logging
import requests
from datetime import datetime
from pathlib import Path

logger = logging.getLogger(__name__)

_MAILTRAP_API_URL = 'https://send.api.mailtrap.io/api/send'
_SENDER_EMAIL = 'hello@demomailtrap.co'
_SENDER_NAME  = 'IntelliHire'

# Directory where HTML emails are saved when API token is absent
_DEV_MAIL_DIR = Path(__file__).resolve().parent.parent / 'dev_emails'


class EmailService:
    """Mailtrap API email sender. Saves HTML files locally when token is absent."""

    def __init__(self, mailtrap_token: str = None, **_ignored):
        # Accept (and silently ignore) legacy smtp_* kwargs for backward compatibility
        self.token = mailtrap_token or os.environ.get('MAILTRAP_API_TOKEN', '')
        self.enabled = bool(self.token)
        if not self.enabled:
            _DEV_MAIL_DIR.mkdir(exist_ok=True)
            logger.warning('⚠️  MAILTRAP_API_TOKEN not set — emails saved to dev_emails/')
            logger.info('   Add MAILTRAP_API_TOKEN=<your_token> to .env to send real emails.')
        else:
            logger.info('✅ Mailtrap API email sender ready.')

    # ─── core send ─────────────────────────────────────────
    def send(self, to_email: str, to_name: str, subject: str, html_body: str) -> bool:
        """Send email via Mailtrap API. Falls back to file-save when unconfigured."""
        if not self.enabled:
            return self._save_to_file(to_email, subject, html_body)

        payload = {
            'from': {'email': _SENDER_EMAIL, 'name': _SENDER_NAME},
            'to':   [{'email': to_email, 'name': to_name or to_email}],
            'subject': subject,
            'html': html_body,
            'category': 'IntelliHire Transactional',
        }
        headers = {
            'Authorization': f'Bearer {self.token}',
            'Content-Type': 'application/json',
        }
        try:
            resp = requests.post(_MAILTRAP_API_URL, json=payload, headers=headers, timeout=10)
            if resp.ok:
                logger.info(f'✅ Email sent to {to_email}: {subject}')
                return True
            logger.error(f'❌ Mailtrap API error {resp.status_code}: {resp.text}')
            return False
        except Exception as e:
            logger.error(f'❌ Email failed to {to_email}: {e}')
            # Fallback: save locally so nothing is lost
            return self._save_to_file(to_email, subject, html_body)

    def _save_to_file(self, to_email: str, subject: str, html_body: str) -> bool:
        """Save email as HTML file and log the path."""
        try:
            slug = subject.lower().replace(' ', '_').replace('—', '-')[:40]
            ts = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
            filename = _DEV_MAIL_DIR / f'{ts}_{slug}.html'
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(html_body)
            logger.info(f'📧 [DEV] Email saved → {filename}')
            logger.info(f'   To: {to_email} | Subject: {subject}')
            return True
        except Exception as e:
            logger.error(f'❌ Failed to save dev email: {e}')
            return False

    # ─── base template ─────────────────────────────────────
    def _base_template(self, content: str) -> str:
        year = datetime.utcnow().year
        return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>IntelliHire</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #060d1a;
    color: #e2e8f0;
    padding: 40px 16px;
    -webkit-font-smoothing: antialiased;
  }}
  .wrapper {{ max-width: 600px; margin: 0 auto; }}

  /* ── Header ── */
  .header {{
    background: linear-gradient(135deg, #0b1120 0%, #0f1e38 100%);
    border: 1px solid rgba(47,151,247,0.2);
    border-bottom: none;
    border-radius: 16px 16px 0 0;
    padding: 32px 40px 28px;
    text-align: center;
  }}
  .logo-wrap {{
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 6px;
  }}
  .logo-icon {{
    width: 36px; height: 36px;
    background: linear-gradient(135deg, #2f97f7, #0ea5e9);
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    line-height: 1;
  }}
  .logo-text {{
    font-size: 22px;
    font-weight: 800;
    background: linear-gradient(90deg, #2f97f7, #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.02em;
  }}
  .tagline {{
    font-size: 11px;
    color: rgba(255,255,255,0.35);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }}

  /* ── Accent bar ── */
  .accent-bar {{
    height: 2px;
    background: linear-gradient(90deg, #2f97f7, #a78bfa, #0ea5e9);
  }}

  /* ── Body ── */
  .body {{
    background: #0b1120;
    border: 1px solid rgba(255,255,255,0.07);
    border-top: none;
    border-bottom: none;
    padding: 40px 40px 32px;
    line-height: 1.75;
    color: #cbd5e1;
  }}
  .body h2 {{
    color: #f1f5f9;
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 16px;
  }}
  .body p {{ margin-bottom: 14px; font-size: 15px; }}
  .body strong {{ color: #e2e8f0; font-weight: 600; }}

  /* ── Button ── */
  .btn-wrap {{ text-align: center; margin: 28px 0; }}
  .btn {{
    display: inline-block;
    padding: 14px 36px;
    background: linear-gradient(135deg, #2f97f7, #0ea5e9);
    color: #ffffff !important;
    text-decoration: none;
    border-radius: 10px;
    font-weight: 700;
    font-size: 15px;
    letter-spacing: 0.01em;
    box-shadow: 0 4px 20px rgba(47,151,247,0.35);
  }}

  /* ── Divider ── */
  .divider {{
    height: 1px;
    background: rgba(255,255,255,0.07);
    margin: 24px 0;
  }}

  /* ── Stat badge ── */
  .stat-badge {{
    display: inline-block;
    padding: 10px 20px;
    background: rgba(47,151,247,0.1);
    border: 1px solid rgba(47,151,247,0.25);
    border-radius: 8px;
    color: #2f97f7;
    font-size: 28px;
    font-weight: 800;
    line-height: 1;
    min-width: 80px;
    text-align: center;
  }}

  /* ── Info box ── */
  .info-box {{
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-left: 3px solid #2f97f7;
    border-radius: 8px;
    padding: 16px 20px;
    margin: 20px 0;
    font-size: 14px;
    color: #94a3b8;
  }}

  /* ── Footer ── */
  .footer {{
    background: #080f1c;
    border: 1px solid rgba(255,255,255,0.06);
    border-top: none;
    border-radius: 0 0 16px 16px;
    padding: 24px 40px;
    text-align: center;
  }}
  .footer p {{
    color: rgba(255,255,255,0.28);
    font-size: 12px;
    line-height: 1.8;
    margin: 0;
  }}
  .footer a {{ color: rgba(47,151,247,0.7); text-decoration: none; }}

  /* ── Responsive ── */
  @media (max-width: 480px) {{
    .header, .body, .footer {{ padding-left: 24px; padding-right: 24px; }}
  }}
</style>
</head>
<body>
<div class="wrapper">
  <!-- Header -->
  <div class="header">
    <div class="logo-wrap">
      <span class="logo-icon">⚡</span>
      <span class="logo-text">IntelliHire</span>
    </div>
    <div class="tagline">AI-Powered Hiring Pipeline &nbsp;·&nbsp; FAST NUCES, Karachi</div>
  </div>
  <div class="accent-bar"></div>

  <!-- Body -->
  <div class="body">
    {content}
  </div>

  <!-- Footer -->
  <div class="footer">
    <p>
      &copy; {year} IntelliHire &mdash; All rights reserved.<br>
      FAST-NUCES Karachi &nbsp;|&nbsp; FYP 2025–26<br>
      <span style="opacity:0.5;">You received this email because you interacted with IntelliHire.</span>
    </p>
  </div>
</div>
</body>
</html>"""

    # ─── specific email types ──────────────────────────────
    def send_application_received(self, to_email: str, to_name: str,
                                   job_title: str, company: str = 'IntelliHire') -> bool:
        subject = f"Application Received — {job_title}"
        html = self._base_template(f"""
        <h2>Hi {to_name} 👋</h2>
        <p>Thank you for applying to <strong>{job_title}</strong> at {company}.</p>
        <p>Your CV has been received and is now being analysed by our AI-powered screening system.
        You'll receive an update once the review is complete.</p>
        <div class="info-box">
          ⏱ &nbsp;Most candidates hear back within <strong>24 hours</strong>. Keep an eye on your inbox.
        </div>
        <p style="color:rgba(255,255,255,0.45); font-size:13px;">Good luck! We'll be in touch soon.</p>
        """)
        return self.send(to_email, to_name, subject, html)

    def send_shortlisted(self, to_email: str, to_name: str,
                          job_title: str, interview_link: str,
                          scheduled_at: str = None) -> bool:
        subject = f"🎉 You're Shortlisted — {job_title}"
        schedule_line = ""
        if scheduled_at:
            schedule_line = f'<div class="info-box">📅 &nbsp;<strong>Scheduled:</strong> {scheduled_at}</div>'
        html = self._base_template(f"""
        <h2>Congratulations, {to_name}! 🎉</h2>
        <p>Great news — you've been <strong>shortlisted</strong> for the <strong>{job_title}</strong> position.</p>
        {schedule_line}
        <p>Click the button below to access your AI interview when you're ready:</p>
        <div class="btn-wrap">
          <a href="{interview_link}" class="btn">Start Your Interview &rarr;</a>
        </div>
        <div class="divider"></div>
        <div class="info-box">
          💡 &nbsp;<strong>Tips:</strong> Use a quiet room, check your webcam &amp; microphone, and keep your CV nearby. The interview is AI-assisted and takes 20–30 minutes.
        </div>
        """)
        return self.send(to_email, to_name, subject, html)

    def send_rejected(self, to_email: str, to_name: str, job_title: str) -> bool:
        subject = f"Application Update — {job_title}"
        html = self._base_template(f"""
        <h2>Hi {to_name},</h2>
        <p>Thank you for your interest in the <strong>{job_title}</strong> position.</p>
        <p>After carefully reviewing all applications, we've decided to move forward with other candidates
        whose profiles more closely match our current requirements.</p>
        <p>We genuinely appreciate the time you invested and encourage you to apply for future openings.</p>
        <div class="info-box">
          🔔 &nbsp;New positions are posted regularly. Watch our LinkedIn page for updates.
        </div>
        <p style="color:rgba(255,255,255,0.45); font-size:13px;">Best wishes for your career journey.</p>
        """)
        return self.send(to_email, to_name, subject, html)

    def send_interview_reminder(self, to_email: str, to_name: str,
                                 job_title: str, interview_link: str,
                                 scheduled_at: str = None) -> bool:
        subject = f"Reminder: Your Interview for {job_title}"
        html = self._base_template(f"""
        <h2>Hi {to_name}, your interview is coming up 🔔</h2>
        <p>This is a friendly reminder that your AI interview for <strong>{job_title}</strong> is scheduled.</p>
        {'<div class="info-box">📅 &nbsp;<strong>Scheduled:</strong> ' + scheduled_at + '</div>' if scheduled_at else ''}
        <div class="btn-wrap">
          <a href="{interview_link}" class="btn">Open Interview Room &rarr;</a>
        </div>
        <div class="info-box">
          💡 &nbsp;Ensure your webcam, microphone, and internet connection are working before you start.
        </div>
        """)
        return self.send(to_email, to_name, subject, html)

    def send_interview_completed(self, to_email: str, to_name: str,
                                  job_title: str, feedback_link: str = None) -> bool:
        subject = f"Interview Complete — {job_title}"
        fb_line = ""
        if feedback_link:
            fb_line = f'<div class="btn-wrap"><a href="{feedback_link}" class="btn">View Your Feedback &rarr;</a></div>'
        html = self._base_template(f"""
        <h2>Interview complete, {to_name}! ✅</h2>
        <p>Thank you for completing your AI interview for <strong>{job_title}</strong>.</p>
        <p>Our team is now reviewing the results alongside the AI-generated report. You'll hear from us soon.</p>
        {fb_line}
        <div class="info-box">
          ⏱ &nbsp;Results are typically reviewed within <strong>48 hours</strong>.
        </div>
        """)
        return self.send(to_email, to_name, subject, html)

    def send_report_ready(self, to_email: str, to_name: str,
                           job_title: str, report_link: str) -> bool:
        subject = f"Candidate Reports Ready — {job_title}"
        html = self._base_template(f"""
        <h2>Your reports are ready 📊</h2>
        <p>The AI-generated candidate reports for <strong>{job_title}</strong> are now available for your review.</p>
        <p>Each report includes fit scoring, skill rubrics, CV analysis, communication &amp; cognitive insights, and integrity signals.</p>
        <div class="btn-wrap">
          <a href="{report_link}" class="btn">View Candidate Reports &rarr;</a>
        </div>
        """)
        return self.send(to_email, to_name, subject, html)

    def send_schedule_invitation(self, to_email: str, to_name: str,
                                  job_title: str, schedule_link: str) -> bool:
        """Invite a shortlisted candidate to pick their interview slot."""
        subject = f"🎉 Schedule Your Interview — {job_title}"
        html = self._base_template(f"""
        <h2>Congratulations, {to_name}! 🎉</h2>
        <p>Great news — you've been <strong>shortlisted</strong> for the <strong>{job_title}</strong> position.</p>
        <p>Please choose a convenient time slot for your AI-powered interview:</p>
        <div class="btn-wrap">
          <a href="{schedule_link}" class="btn">Schedule Your Interview &rarr;</a>
        </div>
        <div class="divider"></div>
        <div class="info-box">
          💡 &nbsp;<strong>Note:</strong> You may reschedule <strong>once</strong> if needed. After booking, you'll receive a reminder 1 hour before your interview.
        </div>
        """)
        return self.send(to_email, to_name, subject, html)

    def send_interview_link(self, to_email: str, to_name: str,
                             job_title: str, interview_link: str) -> bool:
        """Send the interview room link when it's time to start."""
        subject = f"🚀 Your Interview Starts Now — {job_title}"
        html = self._base_template(f"""
        <h2>It's time, {to_name}! 🚀</h2>
        <p>Your AI interview for <strong>{job_title}</strong> is starting now.</p>
        <p>Click the button below to enter the interview room:</p>
        <div class="btn-wrap">
          <a href="{interview_link}" class="btn">Enter Interview Room &rarr;</a>
        </div>
        <div class="info-box">
          💡 &nbsp;Make sure your webcam and microphone are working. Find a quiet space. Good luck!
        </div>
        """)
        return self.send(to_email, to_name, subject, html)

