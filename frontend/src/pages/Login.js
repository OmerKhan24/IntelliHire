import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/* ─── scoped styles ──────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');

  .ih-login-root {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #000;
    font-family: 'DM Sans', sans-serif;
    position: relative;
    overflow: hidden;
    padding: 2rem 1rem;
  }

  /* grid */
  .ih-login-grid {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(47,151,247,0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(47,151,247,0.05) 1px, transparent 1px);
    background-size: 64px 64px;
  }

  /* ambient glows */
  .ih-glow-top {
    position: absolute; pointer-events: none;
    width: 700px; height: 500px;
    top: -15%; left: 50%; transform: translateX(-50%);
    background: radial-gradient(ellipse at center, rgba(47,151,247,0.22) 0%, rgba(47,151,247,0.06) 45%, transparent 70%);
    filter: blur(72px);
    animation: ih-breathe 12s ease-in-out infinite;
  }
  .ih-glow-bl {
    position: absolute; pointer-events: none;
    width: 400px; height: 350px;
    bottom: 0; left: -5%;
    background: radial-gradient(ellipse, rgba(47,151,247,0.12) 0%, transparent 65%);
    filter: blur(60px);
    animation: ih-breathe 16s ease-in-out infinite 2s;
  }
  .ih-glow-tr {
    position: absolute; pointer-events: none;
    width: 350px; height: 300px;
    top: 5%; right: 0;
    background: radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 65%);
    filter: blur(60px);
    animation: ih-breathe 14s ease-in-out infinite 4s;
  }

  @keyframes ih-breathe {
    0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
    50%       { opacity: 0.7; transform: translateX(-50%) scale(1.08); }
  }
  .ih-glow-bl, .ih-glow-tr {
    animation-name: ih-breathe2;
  }
  @keyframes ih-breathe2 {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.6; }
  }

  /* card */
  .ih-card {
    position: relative; z-index: 10;
    width: 100%; max-width: 440px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(47,151,247,0.22);
    border-radius: 20px;
    padding: 2.75rem 2.5rem;
    backdrop-filter: blur(20px);
    box-shadow: 0 0 0 1px rgba(47,151,247,0.08), 0 32px 64px rgba(0,0,0,0.6), 0 0 80px rgba(47,151,247,0.08);
    animation: ih-card-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  @keyframes ih-card-in {
    from { opacity: 0; transform: translateY(24px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  /* top edge glow line */
  .ih-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(47,151,247,0.8), transparent);
    border-radius: 20px 20px 0 0;
  }

  /* logo */
  .ih-logo-wrap {
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 0.5rem;
  }
  .ih-logo-icon {
    width: 48px; height: 48px;
    border: 1px solid rgba(47,151,247,0.35);
    background: rgba(47,151,247,0.1);
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    color: #2f97f7; font-size: 1.35rem;
  }

  .ih-brand {
    font-family: 'DM Sans', sans-serif;
    font-weight: 700; font-size: 1.15rem;
    color: #fff; letter-spacing: -0.01em;
    text-align: center; margin-top: 0.75rem;
  }
  .ih-brand span { color: #2f97f7; }

  .ih-heading {
    font-family: 'DM Sans', sans-serif;
    font-size: 1.7rem; font-weight: 700;
    color: #fff; text-align: center;
    letter-spacing: -0.02em;
    margin-top: 1.5rem; margin-bottom: 0.4rem;
  }
  .ih-sub {
    text-align: center;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem; letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.35);
    margin-bottom: 2rem;
  }

  /* alerts */
  .ih-alert {
    padding: 0.75rem 1rem;
    border-radius: 10px;
    font-size: 0.85rem;
    margin-bottom: 1.25rem;
    display: flex; align-items: flex-start; gap: 0.5rem;
    animation: ih-card-in 0.3s ease both;
  }
  .ih-alert-error {
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.3);
    color: #fca5a5;
  }
  .ih-alert-warn {
    background: rgba(251,191,36,0.1);
    border: 1px solid rgba(251,191,36,0.3);
    color: #fcd34d;
  }
  .ih-alert-close {
    margin-left: auto; cursor: pointer; opacity: 0.6;
    background: none; border: none; color: inherit; font-size: 1rem;
    line-height: 1; padding: 0;
    flex-shrink: 0;
  }
  .ih-alert-close:hover { opacity: 1; }

  /* form */
  .ih-field { margin-bottom: 1.25rem; }
  .ih-label {
    display: block;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem; letter-spacing: 0.15em;
    text-transform: uppercase; color: rgba(255,255,255,0.45);
    margin-bottom: 0.5rem;
  }
  .ih-input-wrap { position: relative; }
  .ih-input-icon {
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    color: rgba(255,255,255,0.3); pointer-events: none;
    display: flex; align-items: center;
  }
  .ih-input-icon-right {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    color: rgba(255,255,255,0.35);
    background: none; border: none; cursor: pointer; padding: 4px;
    display: flex; align-items: center;
    border-radius: 6px;
    transition: color 0.2s, background 0.2s;
  }
  .ih-input-icon-right:hover { color: #2f97f7; background: rgba(47,151,247,0.1); }

  .ih-input {
    width: 100%; box-sizing: border-box;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.95rem;
    padding: 0.75rem 0.9rem 0.75rem 2.75rem;
    outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    -webkit-text-fill-color: #fff;
  }
  .ih-input.no-left-icon { padding-left: 0.9rem; }
  .ih-input.has-right-icon { padding-right: 2.75rem; }
  .ih-input::placeholder { color: rgba(255,255,255,0.25); }
  .ih-input:hover {
    border-color: rgba(47,151,247,0.3);
    background: rgba(255,255,255,0.06);
  }
  .ih-input:focus {
    border-color: #2f97f7;
    background: rgba(47,151,247,0.06);
    box-shadow: 0 0 0 3px rgba(47,151,247,0.15);
  }
  /* autofill fix */
  .ih-input:-webkit-autofill,
  .ih-input:-webkit-autofill:hover,
  .ih-input:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0px 1000px rgba(0,10,25,0.95) inset;
    -webkit-text-fill-color: #fff;
    transition: background-color 9999s ease-in-out 0s;
  }

  /* submit button */
  .ih-btn {
    width: 100%;
    padding: 0.85rem 1.5rem;
    margin-top: 0.5rem; margin-bottom: 1.5rem;
    border: none; border-radius: 10px; cursor: pointer;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.8rem; font-weight: 600;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: #fff;
    background: linear-gradient(135deg, #2f97f7 0%, #1d7dd4 100%);
    box-shadow: 0 4px 24px rgba(47,151,247,0.35);
    transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
    position: relative; overflow: hidden;
    display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  }
  .ih-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(47,151,247,0.5);
  }
  .ih-btn:active:not(:disabled) { transform: translateY(0); }
  .ih-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  /* shimmer */
  .ih-btn::after {
    content: '';
    position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
    transition: left 0.45s ease;
  }
  .ih-btn:hover::after { left: 100%; }

  /* spinner */
  .ih-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: ih-spin 0.7s linear infinite;
  }
  @keyframes ih-spin { to { transform: rotate(360deg); } }

  /* divider */
  .ih-divider {
    display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem;
  }
  .ih-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.08); }
  .ih-divider-text {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.6rem; letter-spacing: 0.15em; text-transform: uppercase;
    color: rgba(255,255,255,0.25);
  }

  /* register link */
  .ih-register-box {
    text-align: center;
    padding: 1rem 1.25rem;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    font-size: 0.875rem;
    color: rgba(255,255,255,0.55);
    transition: background 0.2s, border-color 0.2s;
  }
  .ih-register-box:hover {
    background: rgba(255,255,255,0.05);
    border-color: rgba(47,151,247,0.2);
  }
  .ih-register-link {
    color: #2f97f7; font-weight: 600;
    text-decoration: none;
    transition: color 0.2s;
  }
  .ih-register-link:hover { color: #5cb0fa; }

  /* back to landing */
  .ih-back {
    position: absolute; top: 1.5rem; left: 1.5rem; z-index: 20;
    display: inline-flex; align-items: center; gap: 0.4rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem; letter-spacing: 0.12em; text-transform: uppercase;
    color: rgba(255,255,255,0.35);
    text-decoration: none;
    transition: color 0.2s;
  }
  .ih-back:hover { color: #2f97f7; }
`;

/* ─── SVG icons (no icon font dependency) ───────────────────────────────── */
const BrainIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>
    <path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/>
    <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/>
    <path d="M3.477 10.896a4 4 0 0 1 .585-.396"/>
    <path d="M19.938 10.5a4 4 0 0 1 .585.396"/>
    <path d="M6 18a4 4 0 0 1-1.967-.516"/>
    <path d="M19.967 17.484A4 4 0 0 1 18 18"/>
  </svg>
);
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>
  </svg>
);
const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>
);
const BackIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6"/>
  </svg>
);
const AlertIcon = ({ warn }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={warn ? '#fcd34d' : '#fca5a5'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,marginTop:'1px'}}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

/* ─── Component ──────────────────────────────────────────────────────────── */
const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionExpiredMsg, setSessionExpiredMsg] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const styleRef = useRef(null);

  // Inject scoped CSS
  useEffect(() => {
    const tag = document.createElement('style');
    tag.id = 'ih-login-styles';
    tag.textContent = CSS;
    document.head.appendChild(tag);
    styleRef.current = tag;
    return () => { if (styleRef.current) styleRef.current.remove(); };
  }, []);

  // Session expired check
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('session') === 'expired' || sessionStorage.getItem('sessionExpired') === 'true') {
      setSessionExpiredMsg(true);
      sessionStorage.removeItem('sessionExpired');
      const t = setTimeout(() => setSessionExpiredMsg(false), 8000);
      return () => clearTimeout(t);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSessionExpiredMsg(false);
    setLoading(true);
    const result = await login(username, password);
    setLoading(false);
    if (result.success) {
      const redirectPath = sessionStorage.getItem('redirectAfterLogin');
      sessionStorage.removeItem('redirectAfterLogin');
      if (redirectPath) { navigate(redirectPath); return; }
      const role = result.user?.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'interviewer') navigate('/dashboard');
      else if (role === 'employee') navigate('/employee-dashboard');
      else if (role === 'candidate') navigate('/my-interviews');
      else navigate('/');
    } else {
      setError(result.error);
    }
  };

  const landingUrl = process.env.REACT_APP_LANDING_URL || 'http://localhost:3001';

  return (
    <div className="ih-login-root">
      <div className="ih-login-grid" />
      <div className="ih-glow-top" />
      <div className="ih-glow-bl" />
      <div className="ih-glow-tr" />

      {/* Back to landing */}
      <a href={landingUrl} className="ih-back">
        <BackIcon /> Back to site
      </a>

      <div className="ih-card">
        {/* Logo */}
        <div className="ih-logo-wrap">
          <div className="ih-logo-icon"><BrainIcon /></div>
        </div>
        <div className="ih-brand">Intelli<span>Hire</span></div>

        <h1 className="ih-heading">Welcome back</h1>
        <p className="ih-sub">Sign in to your account</p>

        {/* Alerts */}
        {sessionExpiredMsg && (
          <div className="ih-alert ih-alert-warn">
            <AlertIcon warn />
            <span><strong>Session expired</strong> — please sign in again.</span>
            <button className="ih-alert-close" onClick={() => setSessionExpiredMsg(false)}>✕</button>
          </div>
        )}
        {error && (
          <div className="ih-alert ih-alert-error">
            <AlertIcon />
            <span>{error}</span>
            <button className="ih-alert-close" onClick={() => setError(null)}>✕</button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="ih-field">
            <label className="ih-label">Username or email</label>
            <div className="ih-input-wrap">
              <span className="ih-input-icon"><UserIcon /></span>
              <input
                className="ih-input"
                type="text"
                placeholder="your.username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password */}
          <div className="ih-field">
            <label className="ih-label">Password</label>
            <div className="ih-input-wrap">
              <span className="ih-input-icon"><LockIcon /></span>
              <input
                className="ih-input has-right-icon"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="ih-input-icon-right"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <button type="submit" className="ih-btn" disabled={loading}>
            {loading ? (
              <><span className="ih-spinner" /> Signing in…</>
            ) : (
              <>Sign In <ArrowIcon /></>
            )}
          </button>
        </form>

        <div className="ih-divider">
          <div className="ih-divider-line" />
          <span className="ih-divider-text">New to IntelliHire?</span>
          <div className="ih-divider-line" />
        </div>

        <div className="ih-register-box">
          Don't have an account?{' '}
          <a href="/register" className="ih-register-link">Create account →</a>
        </div>
      </div>
    </div>
  );
};

export default Login;

