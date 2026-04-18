/**
 * IntelliHire — pm2 Ecosystem Config
 * Manages three processes: Next.js landing, Flask backend, CRA frontend.
 *
 * Usage on Contabo (after running deploy.sh):
 *   pm2 start ecosystem.config.js --env production
 *   pm2 save
 *   pm2 startup   (follow the printed command to auto-start on reboot)
 */

module.exports = {
  apps: [
    // ── Landing Page (Next.js — production build) ─────────────────────────
    {
      name: 'intellihire-landing',
      script: 'node_modules/.bin/next',
      args: 'start -p 3001',
      cwd: '../landing_page_mockup',
      interpreter: 'none',
      env: {
        NODE_ENV: 'development',
        PORT: '3001',
        NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
        NEXT_PUBLIC_API_URL: 'http://localhost:5000',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: '3001',
        NEXT_PUBLIC_APP_URL: 'http://localhost:3000',  // update to your domain
        NEXT_PUBLIC_API_URL: 'http://localhost:5000',
      },
      watch: false,
      max_memory_restart: '512M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/landing-error.log',
      out_file: './logs/landing-out.log',
    },

    // ── Backend (Flask / Gunicorn) ─────────────────────────────────────────
    {
      name: 'intellihire-backend',
      script: 'gunicorn',
      args: '"app:create_app()" --bind 0.0.0.0:5000 --workers 4 --timeout 120 --worker-class sync',
      cwd: './backend',
      interpreter: 'none',
      env: {
        FLASK_ENV: 'development',
        NO_FRONTEND: '1',          // prevent app.py from spawning npm again
        PORT: '5000',
      },
      env_production: {
        FLASK_ENV: 'production',
        NO_FRONTEND: '1',
        PORT: '5000',
      },
      watch: false,
      max_memory_restart: '1G',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
    },

    // ── Frontend App (serve pre-built CRA build/) ─────────────────────────
    {
      name: 'intellihire-frontend',
      script: 'serve',
      args: '-s build -l 3000',
      cwd: './frontend',
      interpreter: 'none',
      env: {
        PM2_SERVE_PATH: './build',
        PM2_SERVE_PORT: '3000',
      },
      env_production: {
        PM2_SERVE_PATH: './build',
        PM2_SERVE_PORT: '3000',
      },
      watch: false,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
    },
  ],
};
