#!/usr/bin/env bash
# =============================================================================
#  IntelliHire — Deployment Script (runs on Contabo server)
#  Usage: bash deploy.sh [--restart]
#
#  First-time:      bash server_setup.sh
#  CI/CD re-deploy: bash deploy.sh --restart
# =============================================================================
set -e

REPO_DIR="/root/intellihire"
BACKEND_DIR="$REPO_DIR/backend"
FRONTEND_DIR="$REPO_DIR/frontend"
LOG_DIR="$REPO_DIR/logs"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  IntelliHire Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── 0. Ensure log directory exists ────────────────────────────────────────────
mkdir -p "$LOG_DIR"

# ── 1. Pull latest code ────────────────────────────────────────────────────────
echo "📦  Pulling latest code from production branch..."
git -C "$REPO_DIR" fetch origin
git -C "$REPO_DIR" checkout production
git -C "$REPO_DIR" pull origin production

# ── 2. Backend – Python dependencies ─────────────────────────────────────────
echo "🐍  Installing backend dependencies..."
cd "$BACKEND_DIR"
if [ -f "../.venv/bin/python" ]; then
  source ../.venv/bin/activate
elif [ -f "../.venv_cv/bin/python" ]; then
  source ../.venv_cv/bin/activate
else
  python3 -m venv ../.venv
  source ../.venv/bin/activate
fi
pip install -q -r requirements.txt
pip install -q gunicorn   # ensure gunicorn is present

# ── 3. CRA frontend – install & build ────────────────────────────────────────
echo "⚛️   Building React app..."
cd "$FRONTEND_DIR"
npm ci --silent
npm run build

# ── 4. Next.js landing page – install & build ─────────────────────────────────
echo "🌐  Building Next.js landing page..."
LANDING_DIR="$REPO_DIR/../landing_page_mockup"
if [ -d "$LANDING_DIR" ]; then
  cd "$LANDING_DIR"
  npm ci --silent
  NEXT_PUBLIC_APP_URL="http://207.180.254.104" \
  NEXT_PUBLIC_API_URL="http://207.180.254.104/api" \
  npm run build
else
  echo "⚠️  landing_page_mockup not found at $LANDING_DIR — skipping"
fi

# Install 'serve' globally if missing (used by pm2 to host the CRA static build)
if ! command -v serve &> /dev/null; then
  echo "📡  Installing 'serve' globally..."
  npm install -g serve
fi

# ── 5. Start / Restart with pm2 ───────────────────────────────────────────────
cd "$REPO_DIR"

if [ "$1" == "--restart" ]; then
  echo "🔄  Restarting pm2 processes..."
  pm2 reload ecosystem.config.js --env production
else
  echo "🚀  Starting pm2 processes..."
  pm2 start ecosystem.config.js --env production
fi

pm2 save

echo ""
echo "✅  Deployment complete!"
echo "   App (React)  → http://207.180.254.104/"
echo "   API (Flask)  → http://207.180.254.104/api/"
echo "   Landing      → http://207.180.254.104/landing/"
echo ""
echo "   Useful commands:"
echo "     pm2 status                     — check process health"
echo "     pm2 logs                       — tail all logs"
echo "     pm2 logs intellihire-backend   — backend logs only"
echo "     pm2 startup                    — enable auto-start on reboot"
