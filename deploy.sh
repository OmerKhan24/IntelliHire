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
git -C "$REPO_DIR" reset --hard origin/production
git -C "$REPO_DIR" clean -fd

# ── 2. Backend – Python dependencies ─────────────────────────────────────────
echo "🐍  Installing backend dependencies..."
cd "$BACKEND_DIR"
# Wipe stale venv to avoid Python 3.12 compatibility conflicts
rm -rf "$REPO_DIR/.venv" "$REPO_DIR/.venv_cv"
python3 -m venv "$REPO_DIR/.venv"
source "$REPO_DIR/.venv/bin/activate"
# Pin setuptools<82 (torch requires it) and upgrade pip+wheel
pip install -q --upgrade pip "setuptools>=68,<82" wheel
pip install -q -r requirements.txt
pip install -q gunicorn   # ensure gunicorn is present

# ── 3. CRA frontend – install & build ────────────────────────────────────────
echo "⚛️   Building React app..."
cd "$FRONTEND_DIR"
npm ci --silent
# Empty REACT_APP_API_URL → relative URLs; nginx proxies /api/* to Flask backend
REACT_APP_API_URL='' npm run build

# ── 4. Next.js landing page – install & build ─────────────────────────────────
echo "🌐  Building Next.js landing page..."
LANDING_DIR="$REPO_DIR/landing_page"
if [ -d "$LANDING_DIR" ]; then
  cd "$LANDING_DIR"
  npm ci --legacy-peer-deps
  NEXT_PUBLIC_APP_URL="https://intellihire.com.pk" \
  NEXT_PUBLIC_API_URL="https://intellihire.com.pk" \
  NODE_OPTIONS="--max-old-space-size=1024" \
  npm run build
  mkdir -p "$LANDING_DIR/logs"
  cd "$REPO_DIR"
  pm2 delete intellihire-landing 2>/dev/null || true
  pm2 start "$REPO_DIR/ecosystem.config.js" --only intellihire-landing --env production
  pm2 save
else
  echo "⚠️  landing_page not found at $LANDING_DIR — skipping"
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
