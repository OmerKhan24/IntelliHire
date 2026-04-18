import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LANDING_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap');

  .lp-root *, .lp-root *::before, .lp-root *::after {
    margin: 0; padding: 0; box-sizing: border-box;
  }
  .lp-root {
    --ink: #020408;
    --paper: #f0ece4;
    --acid: #b8ff3c;
    --cold: #3cffee;
    --warn: #ff6b35;
    --mute: #2a2f38;
    --glass: rgba(255,255,255,0.04);
    background: var(--ink);
    color: var(--paper);
    font-family: 'DM Sans', sans-serif;
    overflow-x: hidden;
    cursor: none;
    min-height: 100vh;
  }

  /* Custom cursor */
  .lp-cursor {
    position: fixed; width: 10px; height: 10px;
    background: #b8ff3c; border-radius: 50%;
    pointer-events: none; z-index: 9999;
    transform: translate(-50%,-50%);
    transition: transform 0.1s, width 0.2s, height 0.2s;
    mix-blend-mode: difference;
  }
  .lp-cursor-ring {
    position: fixed; width: 36px; height: 36px;
    border: 1px solid rgba(184,255,60,0.4);
    border-radius: 50%; pointer-events: none;
    z-index: 9998; transform: translate(-50%,-50%);
    transition: all 0.15s ease;
  }

  /* HERO */
  .lp-hero {
    min-height: 100vh;
    display: flex; flex-direction: column;
    justify-content: center; align-items: center;
    position: relative; overflow: hidden;
    padding: 2rem;
    max-width: 100vw;
  }
  .lp-hero-bg {
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse 80% 60% at 50% 0%, rgba(184,255,60,0.06) 0%, transparent 70%),
      radial-gradient(ellipse 40% 40% at 80% 80%, rgba(60,255,238,0.04) 0%, transparent 60%);
  }
  .lp-grid-lines {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 60px 60px;
    -webkit-mask-image: radial-gradient(ellipse 90% 90% at center, black 40%, transparent 100%);
    mask-image: radial-gradient(ellipse 90% 90% at center, black 40%, transparent 100%);
  }
  #lp-particles { position: absolute; inset: 0; pointer-events: none; }
  .lp-hero-content { position: relative; z-index: 2; text-align: center; max-width: 900px; }

  .lp-badge {
    display: inline-flex; align-items: center; gap: 8px;
    border: 1px solid rgba(184,255,60,0.3);
    background: rgba(184,255,60,0.07);
    color: #b8ff3c; font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem; letter-spacing: 0.12em; text-transform: uppercase;
    padding: 6px 14px; border-radius: 100px;
    margin-bottom: 2.5rem;
    animation: lp-fadeSlideUp 0.8s ease 0.2s both;
  }
  .lp-badge-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #b8ff3c;
    animation: lp-pulse 2s infinite;
  }
  @keyframes lp-pulse {
    0%,100% { opacity:1; transform: scale(1); }
    50% { opacity:0.4; transform: scale(1.5); }
  }

  .lp-hero-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(5rem, 14vw, 11rem);
    line-height: 0.92;
    letter-spacing: -0.01em;
    margin-bottom: 2rem;
    animation: lp-fadeSlideUp 0.9s ease 0.4s both;
  }
  .lp-hero-title .accent { color: #b8ff3c; }
  .lp-hero-title .line2 { display: block; color: rgba(240,236,228,0.2); }

  .lp-hero-sub {
    font-size: clamp(1rem, 2.2vw, 1.25rem);
    color: rgba(240,236,228,0.55);
    font-weight: 300;
    max-width: 540px; margin: 0 auto 3rem;
    line-height: 1.65;
    animation: lp-fadeSlideUp 0.9s ease 0.6s both;
  }

  .lp-hero-cta {
    display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;
    animation: lp-fadeSlideUp 0.9s ease 0.8s both;
  }

  .lp-btn-primary {
    background: #b8ff3c; color: #020408;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.8rem; font-weight: 500;
    letter-spacing: 0.08em; text-transform: uppercase;
    padding: 14px 32px; border: none; border-radius: 4px;
    cursor: none; text-decoration: none;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .lp-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(184,255,60,0.35);
  }
  .lp-btn-ghost {
    background: transparent; color: #f0ece4;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.8rem; letter-spacing: 0.08em; text-transform: uppercase;
    padding: 14px 32px;
    border: 1px solid rgba(240,236,228,0.2);
    border-radius: 4px; cursor: none; text-decoration: none;
    transition: border-color 0.2s, color 0.2s;
  }
  .lp-btn-ghost:hover { border-color: #b8ff3c; color: #b8ff3c; }

  @keyframes lp-fadeSlideUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Marquee */
  .lp-marquee-wrap {
    position: relative; overflow: hidden;
    border-top: 1px solid rgba(255,255,255,0.07);
    border-bottom: 1px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.02);
    padding: 14px 0; margin: 0;
  }
  .lp-marquee-track {
    display: flex; gap: 3rem;
    animation: lp-marquee 20s linear infinite;
    white-space: nowrap;
  }
  .lp-marquee-track span {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.72rem; letter-spacing: 0.15em;
    text-transform: uppercase; color: rgba(240,236,228,0.3);
  }
  .lp-marquee-track .sep { color: #b8ff3c; }
  @keyframes lp-marquee {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }

  /* Sections */
  .lp-section { padding: 120px 2rem; max-width: 1100px; margin: 0 auto; }
  .lp-section-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.68rem; letter-spacing: 0.2em; text-transform: uppercase;
    color: #b8ff3c; margin-bottom: 1rem;
  }
  .lp-section-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(3rem, 6vw, 5rem);
    line-height: 1; margin-bottom: 1rem;
  }
  .lp-section-desc {
    color: rgba(240,236,228,0.5); font-size: 1.05rem;
    font-weight: 300; max-width: 500px; line-height: 1.7;
    margin-bottom: 4rem;
  }

  /* Features grid */
  .lp-features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 12px;
    overflow: hidden;
  }
  .lp-feat-card {
    background: #020408;
    padding: 2.5rem;
    position: relative; overflow: hidden;
    transition: background 0.3s;
  }
  .lp-feat-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, var(--feat-color, #b8ff3c), transparent);
    opacity: 0; transition: opacity 0.3s;
  }
  .lp-feat-card:hover { background: rgba(255,255,255,0.03); }
  .lp-feat-card:hover::before { opacity: 1; }
  .lp-feat-icon {
    width: 44px; height: 44px;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.2rem; margin-bottom: 1.5rem;
    background: rgba(255,255,255,0.04);
  }
  .lp-feat-name {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.4rem; letter-spacing: 0.03em; margin-bottom: 0.6rem;
  }
  .lp-feat-desc {
    color: rgba(240,236,228,0.45);
    font-size: 0.9rem; line-height: 1.6; font-weight: 300;
  }
  .lp-feat-tag {
    display: inline-block;
    margin-top: 1.2rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem; letter-spacing: 0.12em;
    text-transform: uppercase; padding: 4px 10px;
    border-radius: 4px;
    background: rgba(255,255,255,0.05);
    color: rgba(240,236,228,0.35);
  }

  /* Stats */
  .lp-stats-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 2px;
    background: rgba(255,255,255,0.05);
    border-radius: 8px; overflow: hidden;
    margin: 80px 0;
  }
  .lp-stat-box { background: #020408; padding: 2.5rem 2rem; text-align: center; }
  .lp-stat-num {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 3.5rem; color: #b8ff3c;
    line-height: 1; display: block;
  }
  .lp-stat-label {
    font-size: 0.8rem; color: rgba(240,236,228,0.4);
    letter-spacing: 0.1em; text-transform: uppercase;
    font-family: 'JetBrains Mono', monospace; margin-top: 0.4rem;
  }

  /* Pipeline */
  .lp-pipeline {
    display: flex; align-items: center;
    gap: 0; flex-wrap: wrap;
    margin-top: 3rem;
  }
  .lp-pipe-step {
    flex: 1; min-width: 140px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    padding: 1.5rem; border-radius: 8px;
    text-align: center; position: relative;
  }
  .lp-pipe-step .p-icon { font-size: 1.6rem; margin-bottom: 0.5rem; }
  .lp-pipe-step .p-name {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1rem; letter-spacing: 0.05em;
    color: rgba(240,236,228,0.85);
  }
  .lp-pipe-arrow {
    color: #b8ff3c; font-size: 1.2rem;
    padding: 0 0.5rem; opacity: 0.5;
    flex-shrink: 0;
  }

  /* Stack section */
  .lp-stack-section {
    border-top: 1px solid rgba(255,255,255,0.06);
    padding-top: 80px;
  }
  .lp-stack-pills { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 2rem; }
  .lp-pill {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase;
    padding: 8px 16px; border-radius: 100px;
    border: 1px solid rgba(255,255,255,0.1);
    color: rgba(240,236,228,0.6);
    transition: all 0.2s; cursor: none;
  }
  .lp-pill:hover { border-color: #b8ff3c; color: #b8ff3c; background: rgba(184,255,60,0.05); }
  .lp-pill.hot { border-color: rgba(184,255,60,0.3); color: #b8ff3c; }

  /* CTA Footer */
  .lp-cta-footer {
    text-align: center;
    padding: 120px 2rem;
    background:
      radial-gradient(ellipse 70% 60% at 50% 100%, rgba(184,255,60,0.06) 0%, transparent 70%);
    border-top: 1px solid rgba(255,255,255,0.06);
  }
  .lp-cta-footer .big-text {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(3.5rem, 9vw, 7rem);
    line-height: 0.95; margin-bottom: 2rem;
  }
  .lp-cta-footer .big-text em { color: #b8ff3c; font-style: normal; }
  .lp-footer-meta {
    margin-top: 4rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem; letter-spacing: 0.15em;
    color: rgba(240,236,228,0.2); text-transform: uppercase;
  }

  /* Scroll reveal */
  .lp-reveal { opacity: 0; transform: translateY(40px); transition: opacity 0.7s ease, transform 0.7s ease; }
  .lp-reveal.visible { opacity: 1; transform: translateY(0); }
`;

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const canvasRef = useRef(null);
  const cursorRef = useRef(null);
  const ringRef = useRef(null);

  // Auth redirect
  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'interviewer') navigate('/dashboard');
      else if (user.role === 'employee') navigate('/employee-dashboard');
      else if (user.role === 'candidate') navigate('/my-interviews');
    }
  }, [user, loading, navigate]);

  // Animations & effects
  useEffect(() => {
    // Inject scoped CSS
    const style = document.createElement('style');
    style.id = 'intellihire-landing-styles';
    style.textContent = LANDING_CSS;
    document.head.appendChild(style);

    // Cursor
    const cursor = cursorRef.current;
    const ring = ringRef.current;
    let mx = 0, my = 0, rx = 0, ry = 0;
    const handleMouseMove = (e) => { mx = e.clientX; my = e.clientY; };
    document.addEventListener('mousemove', handleMouseMove);
    let cursorAnimId;
    const animCursor = () => {
      rx += (mx - rx) * 0.15; ry += (my - ry) * 0.15;
      if (cursor) { cursor.style.left = mx + 'px'; cursor.style.top = my + 'px'; }
      if (ring) { ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; }
      cursorAnimId = requestAnimationFrame(animCursor);
    };
    animCursor();

    // Particles
    const canvas = canvasRef.current;
    let ptAnimId;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      let W, H;
      const pts = [];
      const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
      resize();
      window.addEventListener('resize', resize);
      for (let i = 0; i < 55; i++) pts.push({
        x: Math.random() * 2000 - 500, y: Math.random() * 900,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.2,
        r: Math.random() * 1.5 + 0.5, o: Math.random() * 0.4 + 0.1
      });
      const drawPts = () => {
        ctx.clearRect(0, 0, W, H);
        pts.forEach(p => {
          p.x += p.vx; p.y += p.vy;
          if (p.x < -100) p.x = W + 100; if (p.x > W + 100) p.x = -100;
          if (p.y < -100) p.y = H + 100; if (p.y > H + 100) p.y = -100;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(184,255,60,${p.o})`;
          ctx.fill();
        });
        for (let i = 0; i < pts.length; i++) {
          for (let j = i + 1; j < pts.length; j++) {
            const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 120) {
              ctx.beginPath();
              ctx.moveTo(pts[i].x, pts[i].y);
              ctx.lineTo(pts[j].x, pts[j].y);
              ctx.strokeStyle = `rgba(184,255,60,${0.07 * (1 - d / 120)})`;
              ctx.lineWidth = 0.5; ctx.stroke();
            }
          }
        }
        ptAnimId = requestAnimationFrame(drawPts);
      };
      drawPts();
    }

    // Marquee
    const track = document.getElementById('lp-marquee-track');
    if (track && track.children.length === 0) {
      const items = [
        'RAG Interview Engine', 'YOLOv8 Proctoring', 'Voice AI Pipeline',
        'Multi-Modal Scoring', 'Gemini + LangChain', 'ChromaDB Vectors',
        'React TypeScript', 'Flask API', 'JWT Auth', 'CV Intelligence',
        'Gaze Tracking', 'Anti-Cheat System'
      ];
      const full = [...items, ...items, ...items, ...items];
      full.forEach((t, i) => {
        const s = document.createElement('span'); s.textContent = t; track.appendChild(s);
        if (i < full.length - 1) {
          const d = document.createElement('span'); d.className = 'sep'; d.textContent = '·'; track.appendChild(d);
        }
      });
    }

    // Scroll reveal
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.12 });
    document.querySelectorAll('.lp-reveal').forEach(el => obs.observe(el));

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(cursorAnimId);
      cancelAnimationFrame(ptAnimId);
      obs.disconnect();
      const s = document.getElementById('intellihire-landing-styles');
      if (s) s.remove();
    };
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#020408', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#b8ff3c', fontFamily: 'JetBrains Mono, monospace', fontSize: '1rem', letterSpacing: '0.1em' }}>
          LOADING...
        </span>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="lp-root">
      <div className="lp-cursor" ref={cursorRef} />
      <div className="lp-cursor-ring" ref={ringRef} />

      {/* HERO */}
      <div className="lp-hero">
        <div className="lp-hero-bg" />
        <div className="lp-grid-lines" />
        <canvas id="lp-particles" ref={canvasRef} />
        <div className="lp-hero-content">
          <div className="lp-badge">
            <span className="lp-badge-dot" />
            Final Year Project · AI Systems · 2025
          </div>
          <h1 className="lp-hero-title">
            INTELLI<span className="accent">HIRE</span>
            <span className="line2">REIMAGINED</span>
          </h1>
          <p className="lp-hero-sub">
            AI-powered candidate screening that reads resumes, conducts voice interviews,
            detects cheating in real-time, and ranks candidates — automatically.
          </p>
          <div className="lp-hero-cta">
            <button className="lp-btn-primary" onClick={() => navigate('/register')}>
              Get Started
            </button>
            <button className="lp-btn-ghost" onClick={() => navigate('/login')}>
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* MARQUEE */}
      <div className="lp-marquee-wrap">
        <div className="lp-marquee-track" id="lp-marquee-track" />
      </div>

      {/* FEATURES */}
      <div className="lp-section" id="features">
        <p className="lp-section-label lp-reveal">Core Capabilities</p>
        <h2 className="lp-section-title lp-reveal">Built Different.</h2>
        <p className="lp-section-desc lp-reveal">Every layer of the hiring pipeline — automated, scored, and monitored by AI.</p>
        <div className="lp-features-grid lp-reveal">
          {[
            { color: '#b8ff3c', icon: '🎙️', name: 'Voice Interviews', desc: 'Real-time STT/TTS pipeline. Candidates speak naturally; AI listens, responds, and adapts questions dynamically.', tag: 'Gemini AI · gTTS · SpeechRecognition' },
            { color: '#3cffee', icon: '🧠', name: 'RAG Question Engine', desc: "Questions generated from the candidate's own CV and the job description. No two interviews are the same.", tag: 'LangChain · ChromaDB · LLM' },
            { color: '#ff6b35', icon: '👁️', name: 'Live Proctoring', desc: 'YOLOv8 detects phones. MediaPipe tracks gaze. Tab switching logged. Behavioral flags raised instantly.', tag: 'YOLOv8 · MediaPipe · OpenCV' },
            { color: '#b8ff3c', icon: '📊', name: 'Multi-Modal Scoring', desc: 'Verbal confidence, semantic accuracy, facial micro-expressions, and behavioral signals — fused into one score.', tag: 'Sentence Transformers · NLP' },
            { color: '#3cffee', icon: '📄', name: 'CV Intelligence', desc: 'Extracts skills, experience, and gaps. Matches against job requirements. Ranks candidates before they even interview.', tag: 'DeepSeek · MySQL · ChromaDB' },
            { color: '#ff6b35', icon: '🏢', name: 'HR Dashboard', desc: 'Full role-based access. Create jobs, manage candidates, review AI reports, and make decisions — all in one place.', tag: 'React · TypeScript · JWT' },
          ].map((f) => (
            <div key={f.name} className="lp-feat-card" style={{ '--feat-color': f.color }}>
              <div className="lp-feat-icon">{f.icon}</div>
              <div className="lp-feat-name">{f.name}</div>
              <div className="lp-feat-desc">{f.desc}</div>
              <span className="lp-feat-tag">{f.tag}</span>
            </div>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 2rem' }}>
        <div className="lp-stats-row lp-reveal">
          {[
            { num: '6', label: 'AI Models' },
            { num: '4', label: 'Modalities' },
            { num: 'RAG', label: 'Question Gen' },
            { num: '0', label: 'Human Bias' },
            { num: '∞', label: 'Scalability' },
          ].map((s) => (
            <div key={s.label} className="lp-stat-box">
              <span className="lp-stat-num">{s.num}</span>
              <span className="lp-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* PIPELINE */}
      <div className="lp-section lp-stack-section">
        <p className="lp-section-label lp-reveal">How It Works</p>
        <h2 className="lp-section-title lp-reveal">The Pipeline</h2>
        <div className="lp-pipeline lp-reveal">
          {[
            { icon: '📤', name: 'CV Upload' },
            null,
            { icon: '🔍', name: 'RAG Parse' },
            null,
            { icon: '🎙️', name: 'AI Interview' },
            null,
            { icon: '👁️', name: 'Proctor' },
            null,
            { icon: '📊', name: 'Score' },
            null,
            { icon: '✅', name: 'HR Report' },
          ].map((item, i) =>
            item === null ? (
              <div key={i} className="lp-pipe-arrow">→</div>
            ) : (
              <div key={i} className="lp-pipe-step">
                <div className="p-icon">{item.icon}</div>
                <div className="p-name">{item.name}</div>
              </div>
            )
          )}
        </div>

        <p className="lp-section-label lp-reveal" style={{ marginTop: '5rem' }}>Tech Stack</p>
        <div className="lp-stack-pills lp-reveal">
          {['Gemini AI', 'LangChain', 'YOLOv8', 'MediaPipe', 'React TypeScript', 'Flask Python',
            'MySQL', 'ChromaDB', 'WebRTC', 'JWT Auth', 'Sentence Transformers', 'gTTS', 'OpenCV', 'SQLAlchemy'
          ].map((pill) => (
            <span key={pill} className={`lp-pill${['Gemini AI','LangChain','YOLOv8','MediaPipe'].includes(pill) ? ' hot' : ''}`}>
              {pill}
            </span>
          ))}
        </div>
      </div>

      {/* CTA FOOTER */}
      <div className="lp-cta-footer">
        <div className="big-text lp-reveal">
          HIRE SMARTER.<br /><em>NOT HARDER.</em>
        </div>
        <div className="lp-hero-cta lp-reveal" style={{ marginTop: '2rem' }}>
          <button className="lp-btn-primary" onClick={() => navigate('/register')}>
            Start for Free
          </button>
          <a
            href="https://github.com/OmerKhan24/intellihire_production"
            target="_blank"
            rel="noopener noreferrer"
            className="lp-btn-ghost"
            style={{ display: 'inline-block' }}
          >
            GitHub Repository
          </a>
        </div>
        <div className="lp-footer-meta lp-reveal">
          IntelliHire · Final Year Project · FAST-NUCES · 2025 · Omer Khan
        </div>
      </div>
    </div>
  );
}
