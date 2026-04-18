#!/usr/bin/env bash
# =============================================================================
#  IntelliHire — Contabo Deployment Script
#  Usage: bash deploy.sh [--restart]
#
#  First-time:   bash deploy.sh
#  Update/redeploy: bash deploy.sh --restart
# =============================================================================
set -e

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
LANDING_DIR="$(cd "$REPO_DIR/../landing_page_mockup" && pwd)"
LOG_DIR="$REPO_DIR/logs"
FRONTEND_DIR="$REPO_DIR/frontend"
BACKEND_DIR="$REPO_DIR/backend"

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
cd "$LANDING_DIR"
npm ci --silent
NEXT_PUBLIC_APP_URL="http://localhost:3000" \
NEXT_PUBLIC_API_URL="http://localhost:5000" \
npm run build

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
echo "   Landing page → http://0.0.0.0:3001  (Next.js)"
echo "   React app    → http://0.0.0.0:3000  (CRA)"
echo "   Backend API  → http://0.0.0.0:5000  (Flask)"
echo ""
echo "   Useful commands:"
echo "     pm2 status                     — check process health"
echo "     pm2 logs                       — tail all logs"
echo "     pm2 logs intellihire-backend   — backend logs only"
echo "     pm2 startup                    — enable auto-start on reboot"
