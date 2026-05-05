#!/usr/bin/env bash
# =============================================================================
#  IntelliHire — ONE-TIME Server Setup for Ubuntu 24.04 (Contabo)
#  Run as root: bash server_setup.sh
#
#  What this does:
#    1. Updates apt
#    2. Installs Node.js 20 LTS + npm
#    3. Installs MySQL 8
#    4. Installs Nginx
#    5. Installs PM2 + serve globally
#    6. Installs Python build tools + pip packages
#    7. Clones the repo → /root/intellihire
#    8. Sets up Python venv + backend deps
#    9. Creates intellihire_db in MySQL
#   10. Builds React frontend
#   11. Starts PM2 with ecosystem.config.js
#   12. Generates deploy SSH key pair for GitHub Actions
#   13. Configures Nginx reverse proxy
# =============================================================================
set -e

REPO_URL="https://github.com/OmerKhan24/intellihire_production.git"
REPO_DIR="/root/intellihire"
BRANCH="production"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${GREEN}[$(date +%T)] $*${NC}"; }
warn() { echo -e "${YELLOW}[$(date +%T)] $*${NC}"; }
fail() { echo -e "${RED}[$(date +%T)] $*${NC}"; exit 1; }

# ── 0. Root check ─────────────────────────────────────────────────────────────
[[ $EUID -ne 0 ]] && fail "Run as root"

log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "  IntelliHire — Server Setup"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── 1. System packages ────────────────────────────────────────────────────────
log "📦  Updating apt..."
apt-get update -qq
apt-get install -y -qq \
  curl wget gnupg2 ca-certificates lsb-release \
  build-essential libssl-dev libffi-dev \
  python3-pip python3-venv python3-dev \
  git nginx ufw \
  libmysqlclient-dev pkg-config \
  ffmpeg libsm6 libxext6   # for OpenCV

# ── 2. Node.js 20 LTS ─────────────────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  log "⬢  Installing Node.js 20 LTS..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
else
  log "⬢  Node.js already installed: $(node -v)"
fi

# ── 3. MySQL 8 ────────────────────────────────────────────────────────────────
if ! command -v mysql &>/dev/null; then
  log "🐬  Installing MySQL 8..."
  apt-get install -y mysql-server
  systemctl enable --now mysql
  # Secure MySQL and create DB
  mysql -u root <<'SQL'
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';
DELETE FROM mysql.user WHERE User='';
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';
CREATE DATABASE IF NOT EXISTS intellihire_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
FLUSH PRIVILEGES;
SQL
  log "✅  MySQL: intellihire_db created"
else
  log "🐬  MySQL already installed"
  mysql -u root -e "CREATE DATABASE IF NOT EXISTS intellihire_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null || true
fi

# ── 4. PM2 + serve ────────────────────────────────────────────────────────────
log "🔄  Installing PM2 and serve globally..."
npm install -g pm2 serve --silent

# ── 5. Clone / update repo ────────────────────────────────────────────────────
if [ -d "$REPO_DIR/.git" ]; then
  log "📥  Repo already cloned — pulling $BRANCH..."
  git -C "$REPO_DIR" fetch origin
  git -C "$REPO_DIR" checkout "$BRANCH"
  git -C "$REPO_DIR" pull origin "$BRANCH"
else
  log "📥  Cloning repo..."
  git clone --branch "$BRANCH" "$REPO_URL" "$REPO_DIR" || \
    fail "Clone failed. Make sure the repo exists and branch '$BRANCH' exists."
fi

# ── 6. Backend Python venv ────────────────────────────────────────────────────
log "🐍  Setting up Python venv..."
cd "$REPO_DIR"
python3 -m venv .venv
source .venv/bin/activate
pip install -q --upgrade pip
pip install -q gunicorn
pip install -q -r backend/requirements.txt
deactivate
log "✅  Python deps installed"

# ── 7. Copy .env (if not present) ────────────────────────────────────────────
if [ ! -f "$REPO_DIR/backend/.env" ]; then
  warn "⚠️  backend/.env not found — copying from .env.example"
  warn "    Edit $REPO_DIR/backend/.env and add your real API keys!"
  cp "$REPO_DIR/.env.example" "$REPO_DIR/backend/.env" 2>/dev/null || \
  cp "$REPO_DIR/.env.example" "$REPO_DIR/.env" 2>/dev/null || true
fi
if [ ! -f "$REPO_DIR/.env" ]; then
  cp "$REPO_DIR/.env.example" "$REPO_DIR/.env" 2>/dev/null || true
fi

# ── 8. Frontend React build ───────────────────────────────────────────────────
log "⚛️   Building React frontend..."
cd "$REPO_DIR/frontend"
npm ci --silent
REACT_APP_API_URL="http://207.180.254.104:5000" npm run build
log "✅  React build done"

# ── 9. PM2 start ─────────────────────────────────────────────────────────────
log "🚀  Starting PM2..."
cd "$REPO_DIR"
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup systemd -u root --hp /root | tail -1 | bash || true
log "✅  PM2 processes started"

# ── 10. Nginx config ─────────────────────────────────────────────────────────
log "🌐  Configuring Nginx..."
cat > /etc/nginx/sites-available/intellihire <<'NGINX'
server {
    listen 80;
    server_name 207.180.254.104 _;

    # React app (CRA served by PM2/serve on :3000)
    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Flask backend API
    location /api/ {
        proxy_pass         http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 120s;
        client_max_body_size 50M;
    }

    # Next.js landing page on :3001 — accessible at /landing
    location /landing/ {
        proxy_pass         http://127.0.0.1:3001/;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/intellihire /etc/nginx/sites-enabled/intellihire
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx && systemctl enable nginx
log "✅  Nginx configured and running"

# ── 11. Firewall ──────────────────────────────────────────────────────────────
log "🔒  Configuring firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# ── 12. Generate deploy SSH key for GitHub Actions ────────────────────────────
KEY_PATH="/root/.ssh/github_actions_deploy"
if [ ! -f "$KEY_PATH" ]; then
  log "🔑  Generating SSH deploy key for GitHub Actions..."
  ssh-keygen -t ed25519 -C "github-actions-deploy" -f "$KEY_PATH" -N ""
  cat "$KEY_PATH.pub" >> /root/.ssh/authorized_keys
  chmod 600 /root/.ssh/authorized_keys
fi

log ""
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "✅  Setup complete!"
log ""
log "  App (React)    → http://207.180.254.104/"
log "  API (Flask)    → http://207.180.254.104/api/"
log "  Landing(Next)  → http://207.180.254.104/landing/"
log ""
log "🔑  GitHub Actions deploy private key (add as secret CONTABO_SSH_PRIVATE_KEY):"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat "$KEY_PATH"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log ""
warn "⚠️  IMPORTANT: Edit $REPO_DIR/.env or $REPO_DIR/backend/.env"
warn "   and set your real ELEVENLABS_API_KEY, DEEPSEEK_API_KEY, etc."
warn "   Then run: cd $REPO_DIR && pm2 reload ecosystem.config.js --env production"
