"""Quick test: send one email via Mailtrap API to verify integration."""
import sys
import os

# Allow running from repo root
sys.path.insert(0, os.path.dirname(__file__))
os.environ['MAILTRAP_API_TOKEN'] = '54bc950664254deab562d6cc8444ed48'

from services.email_service import EmailService

svc = EmailService()
ok = svc.send(
    to_email='omerkham12345@gmail.com',
    to_name='Omer Khan',
    subject='IntelliHire — Mailtrap API test',
    html_body='<h1 style="font-family:sans-serif;color:#2f97f7">It works!</h1>'
              '<p style="font-family:sans-serif">IntelliHire email integration is live via Mailtrap API.</p>',
)
print('Result:', 'SENT' if ok else 'FAILED')
