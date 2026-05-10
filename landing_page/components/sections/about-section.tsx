'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Mic, Brain, Shield, CheckCircle2, Zap, Clock, Users, BarChart3, FileText, Briefcase, Link2, Building2, Upload, Filter, Calendar } from 'lucide-react';

/* ─── Animated waveform ─────────────────────────────────── */
const HEIGHTS = [5,12,20,28,22,14,30,18,10,26,20,32,16,24,10,28,18,14,22,8,24,30,16,12,26];
function LiveWaveform({ color }: { color: string }) {
  return (
    <div className="flex items-center justify-center gap-[3px] h-10">
      {HEIGHTS.map((h, i) => (
        <motion.div
          key={i}
          className="rounded-full flex-shrink-0"
          style={{ width: 3, minHeight: 4, background: color }}
          animate={{ height: [4, h, 4], opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 0.55 + (i % 5) * 0.11,
            repeat: Infinity,
            delay: i * 0.045,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/* ─── Flowing pipeline lines ────────────────────────────── */
const PIPE_NODES = [
  { x: 24,  icon: FileText,  hint: 'CV' },
  { x: 66,  icon: Briefcase, hint: 'JD' },
  { x: 108, icon: Link2,     hint: 'Link' },
  { x: 150, icon: BarChart3, hint: 'Score' },
  { x: 192, icon: Building2, hint: 'ATS' },
];
const CX = 108, CY = 108;

function PipelineFlow() {
  return (
    <div className="relative w-full" style={{ height: 156 }}>
      <svg className="absolute inset-0 w-full" viewBox="0 0 216 136" fill="none">
        {PIPE_NODES.map((n, i) => {
          const d = `M ${n.x},22 C ${n.x},68 ${CX},68 ${CX},${CY}`;
          return (
            <g key={i}>
              <path d={d} stroke="rgba(99,102,241,0.12)" strokeWidth={1.5} />
              <motion.path
                d={d}
                stroke="rgba(99,102,241,0.55)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeDasharray="5 18"
                animate={{ strokeDashoffset: [0, -23] }}
                transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.2, ease: 'linear' }}
              />
            </g>
          );
        })}
      </svg>

      {/* Source nodes — bob up/down */}
      {PIPE_NODES.map((n, i) => (
        <motion.div
          key={i}
          className="absolute -translate-x-1/2"
          style={{ left: `${(n.x / 216) * 100}%`, top: 0 }}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.38, ease: 'easeInOut' }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}
          >
            <n.icon className="w-4 h-4" style={{ color: 'rgba(99,102,241,0.85)' }} />
          </div>
        </motion.div>
      ))}

      {/* Central AI brain node */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center"
        style={{
          bottom: -16,
          background: 'radial-gradient(circle, rgba(99,102,241,0.28), rgba(0,0,0,0.85))',
          border: '1.5px solid rgba(99,102,241,0.5)',
        }}
        animate={{ boxShadow: ['0 0 10px rgba(99,102,241,0.2)', '0 0 28px rgba(99,102,241,0.55)', '0 0 10px rgba(99,102,241,0.2)'] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Brain className="w-5 h-5 text-indigo-400" />
      </motion.div>
    </div>
  );
}

/* ─── Scrolling trust tags ──────────────────────────────── */
const TAGS_A = ['Unbiased','Fair Process','GDPR Ready','Compliant','Transparent','AI-Verified','Explainable','Reliable'];
const TAGS_B = ['Zero Bias','Auditable','Privacy-First','ISO-Aligned','Neutral AI','No Discrimination','Tamper-Free','Secure'];

function TagRow({ tags, reverse, color }: { tags: string[]; reverse?: boolean; color: string }) {
  const doubled = [...tags, ...tags];
  return (
    <div className="overflow-hidden w-full py-1">
      <motion.div
        className="flex gap-2 w-max"
        animate={{ x: reverse ? [-460, 0] : [0, -460] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
      >
        {doubled.map((t, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap"
            style={{ background: `${color}10`, border: `1px solid ${color}28`, color: `${color}cc` }}
          >
            <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: color }} />
            {t}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ─── Pipeline steps (merged from How It Works) ─────────── */
const PIPELINE_STEPS = [
  { num: '01', icon: Upload,    title: 'Post Your Job',    color: '#2f97f7',            glow: 'rgba(47,151,247,0.28)',   desc: 'Upload your JD, set scoring criteria, and define your ideal candidate profile.', detail: 'Live in < 30s' },
  { num: '02', icon: Link2,     title: 'Share One Link',   color: '#818cf8',            glow: 'rgba(129,140,248,0.28)', desc: 'Post on LinkedIn, job boards, or email. Candidates self-register through your portal.', detail: '247 applicants / 3 days' },
  { num: '03', icon: Filter,    title: 'AI Screens CVs',   color: '#a78bfa',            glow: 'rgba(167,139,250,0.28)', desc: 'ATS + RAG pipeline scores every CV against your criteria in seconds. Weak matches filtered out.', detail: '247 → 89 shortlisted' },
  { num: '04', icon: Calendar,  title: 'Auto Scheduling',  color: '#c084fc',            glow: 'rgba(192,132,252,0.28)', desc: 'Shortlisted candidates self-select interview slots. Zero coordination overhead.', detail: '34 slots booked' },
  { num: '05', icon: Mic,       title: 'AI Interview',     color: '#e879f9',            glow: 'rgba(232,121,249,0.28)', desc: 'Voice AI conducts adaptive interviews with real-time integrity monitoring throughout.', detail: 'Avg 28 min session' },
  { num: '06', icon: BarChart3, title: 'Ranked Reports',   color: '#34d399',            glow: 'rgba(52,211,153,0.28)',  desc: 'HR receives a ranked shortlist with scores, transcripts, and hire recommendations.', detail: 'Top 8 to inbox' },
];

/* ─── Product mockup dashboard ──────────────────────────── */
const CANDIDATES = [
  { init: 'AK', name: 'Ahmed Khurram', score: 94, label: 'Interview Done', col: '#34d399' },
  { init: 'SM', name: 'Sara Malik',    score: 89, label: 'Scheduled',      col: 'var(--color-brand)' },
  { init: 'AR', name: 'Ali Raza',      score: 84, label: 'Interview Done', col: '#34d399' },
  { init: 'ZB', name: 'Zara Butt',     score: 61, label: 'CV Rejected',    col: '#f87171' },
];

function MockDashboard({ inView }: { inView: boolean }) {
  return (
    <div
      className="rounded-2xl border overflow-hidden relative"
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 32px 80px rgba(99,102,241,0.12)',
      }}
    >
      {/* Top gradient glow line */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)' }} />

      {/* Window bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)' }}>
        <div className="flex gap-1.5">
          {['#ef4444','#f59e0b','#22c55e'].map((c) => <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c + '80' }} />)}
        </div>
        <div className="flex-1 h-6 rounded-md text-[10px] font-mono text-white/25 flex items-center px-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)' }}>
          intellihire.app/dashboard
        </div>
      </div>

      <div className="p-5">
        {/* Job header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-white font-semibold text-sm">Senior Frontend Engineer</div>
            <div className="text-white/35 text-[10px] mt-0.5">247 applicants · 34 scheduled · 8 shortlisted</div>
          </div>
          <div className="px-2.5 py-1 rounded-full text-[10px] font-medium flex items-center gap-1.5" style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
          </div>
        </div>

        {/* Funnel stats */}
        <div className="flex items-center gap-2 mb-4 text-[10px] text-white/40">
          {['247 Applied','→','89 CV Pass','→','34 Scheduled','→','8 Shortlist'].map((s, i) => (
            <span key={i} className={s === '→' ? 'text-white/15' : 'px-2 py-0.5 rounded-md'} style={s !== '→' ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' } : {}}>{s}</span>
          ))}
        </div>

        {/* Candidate rows */}
        {CANDIDATES.map((c, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-3 mb-3"
            initial={{ opacity: 0, x: 14 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.5 + i * 0.08 }}
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0" style={{ background: `${c.col}25`, border: `1px solid ${c.col}45` }}>{c.init}</div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-[11px] font-medium truncate">{c.name}</div>
              <div className="h-1.5 rounded-full mt-1 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <motion.div className="h-full rounded-full" style={{ background: c.col }} initial={{ width: 0 }} animate={inView ? { width: `${c.score}%` } : {}} transition={{ duration: 0.9, delay: 0.6 + i * 0.1, ease: 'easeOut' }} />
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-[11px] font-bold" style={{ color: c.col }}>{c.score}</div>
              <div className="text-[9px] text-white/25 mt-0.5">{c.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Floating badge */}
      <motion.div
        className="absolute -bottom-3 -right-3 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-lg z-10"
        style={{ background: 'rgba(99,102,241,0.88)', boxShadow: '0 8px 28px rgba(99,102,241,0.45)' }}
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        🎯 Top 8 Candidates Ready
      </motion.div>
    </div>
  );
}

/* ─── Stats ─────────────────────────────────────────────── */
const STATS = [
  { v: '10×',    l: 'Faster screening',        icon: Clock },
  { v: '90%',    l: 'HR time saved',            icon: Zap },
  { v: '247→8',  l: 'Applicants to shortlist',  icon: Users },
  { v: 'Zero',   l: 'Manual CV reviews',        icon: CheckCircle2 },
];

const BULLETS = [
  'AI screens every CV in seconds against your exact criteria',
  'Conversational voice AI conducts adaptive, dynamic interviews',
  'YOLOv8 proctoring ensures every session is tamper-free',
  'HR receives ranked reports with full transcripts and scores',
];

/* ─── Section ───────────────────────────────────────────── */
export function AboutSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} id="about" className="relative py-28 px-6 bg-black overflow-hidden">
      {/* Background atmosphere */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full" style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 65%)' }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] rounded-full" style={{ background: 'radial-gradient(ellipse, rgba(47,151,247,0.06) 0%, transparent 65%)' }} />
        <div className="absolute inset-0 opacity-[0.022]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.7) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* ── Heading ── */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {/* Vertical connector + badge */}
          <div className="flex flex-col items-center mb-5">
            <div className="w-px h-8 mb-2" style={{ background: 'linear-gradient(to bottom, transparent, rgba(99,102,241,0.6))' }} />
            <div className="w-1.5 h-1.5 rounded-full mb-4" style={{ background: '#6366f1', boxShadow: '0 0 8px rgba(99,102,241,0.8)' }} />
            <div
              className="inline-flex items-center gap-3"
            >
              <div className="h-px w-12" style={{ background: 'linear-gradient(to right, transparent, rgba(99,102,241,0.5))' }} />
              <div
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 20px rgba(99,102,241,0.2), inset 0 -1px 0 rgba(99,102,241,0.6)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                About IntelliHire
              </div>
              <div className="h-px w-12" style={{ background: 'linear-gradient(to left, transparent, rgba(99,102,241,0.5))' }} />
            </div>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
            Hiring is a pipeline.{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, #6366f1, #a78bfa, var(--color-brand))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              We automated it.
            </span>
          </h2>
          <p className="text-lg text-white/45 max-w-2xl mx-auto leading-relaxed">
            IntelliHire is an AI-native recruitment platform that replaces manual screening, coordination, and initial interviews with an intelligent, fully automated pipeline — so your team focuses on final decisions, not process overhead.
          </p>
        </motion.div>

        {/* ── Two-column: text + dashboard ── */}
        <div className="grid md:grid-cols-2 gap-14 items-center mb-20">
          {/* Left */}
          <div>
            <motion.h3
              className="text-2xl font-bold text-white mb-4 leading-snug"
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Built for teams tired of<br />hiring the hard way.
            </motion.h3>
            <motion.p
              className="text-white/45 text-sm leading-relaxed mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.18 }}
            >
              Traditional hiring costs $4,700 per hire and takes 23 days on average. 75% of CVs are never read. IntelliHire fixes this — one link triggers the full pipeline: scoring, scheduling, AI interviews, proctoring, and ranked reports.
            </motion.p>

            {/* Bullet list */}
            <div className="space-y-3 mb-8">
              {BULLETS.map((b, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -14 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.28 + i * 0.07 }}
                >
                  <div className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.4)' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  </div>
                  <span className="text-sm text-white/55">{b}</span>
                </motion.div>
              ))}
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              {STATS.map((s, i) => (
                <motion.div
                  key={i}
                  className="rounded-xl p-4"
                  style={{ background: 'rgba(255,255,255,0.028)', border: '1px solid rgba(255,255,255,0.065)' }}
                  initial={{ opacity: 0, y: 14 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.42 + i * 0.08 }}
                  whileHover={{ scale: 1.03, transition: { duration: 0.15 } }}
                >
                  <div className="text-2xl font-bold text-white mb-0.5">{s.v}</div>
                  <div className="text-[11px] text-white/35">{s.l}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: mock dashboard */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="relative"
          >
            <MockDashboard inView={inView} />
          </motion.div>
        </div>

        {/* ── 3 animated feature cards ── */}
        <div className="grid md:grid-cols-3 gap-5">

          {/* Card 1: AI Candidate Screening — flowing pipeline lines */}
          <motion.div
            className="rounded-2xl overflow-hidden border"
            style={{ background: 'linear-gradient(145deg, rgba(99,102,241,0.06), rgba(0,0,0,0.6))', borderColor: 'rgba(99,102,241,0.18)' }}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <div className="px-5 pt-5 pb-2" style={{ background: 'radial-gradient(ellipse at center bottom, rgba(99,102,241,0.1), transparent 70%)' }}>
              <PipelineFlow />
            </div>
            <div className="px-5 pb-5">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full mb-3" style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }}>
                <Brain className="w-3 h-3" /> AI Screening
              </div>
              <h3 className="text-white font-semibold text-[15px] mb-1.5">Seamless CV Ingestion</h3>
              <p className="text-white/38 text-[12px] leading-relaxed">Every CV flows into our ATS + RAG scoring engine automatically. Criteria-matched, ranked, and shortlisted in seconds.</p>
            </div>
          </motion.div>

          {/* Card 2: Trusted & Compliant — scrolling tags */}
          <motion.div
            className="rounded-2xl overflow-hidden border"
            style={{ background: 'linear-gradient(145deg, rgba(52,211,153,0.05), rgba(0,0,0,0.6))', borderColor: 'rgba(52,211,153,0.16)' }}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.72 }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <div className="px-5 pt-5 pb-3 space-y-2" style={{ background: 'radial-gradient(ellipse at center bottom, rgba(52,211,153,0.07), transparent 70%)' }}>
              <div className="flex items-center justify-center mb-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.12)', border: '1.5px solid rgba(52,211,153,0.35)' }}>
                  <Shield className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <TagRow tags={TAGS_A} color="#34d399" />
              <TagRow tags={TAGS_B} color="#34d399" reverse />
            </div>
            <div className="px-5 pb-5">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full mb-3" style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)' }}>
                <Shield className="w-3 h-3" /> Trusted Process
              </div>
              <h3 className="text-white font-semibold text-[15px] mb-1.5">Trusted Authentication</h3>
              <p className="text-white/38 text-[12px] leading-relaxed">Fully auditable, GDPR-aligned pipeline. Every AI decision is explainable, logged, and bias-checked end to end.</p>
            </div>
          </motion.div>

          {/* Card 3: Voice AI Interview — live waveform */}
          <motion.div
            className="rounded-2xl overflow-hidden border"
            style={{ background: 'linear-gradient(145deg, rgba(167,139,250,0.06), rgba(0,0,0,0.6))', borderColor: 'rgba(167,139,250,0.18)' }}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.84 }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <div className="px-5 pt-5 pb-3 flex flex-col items-center gap-3" style={{ background: 'radial-gradient(ellipse at center bottom, rgba(167,139,250,0.1), transparent 70%)' }}>
              {/* Mic node with glow rings */}
              <div className="relative">
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ margin: -12, border: '1px solid rgba(167,139,250,0.2)' }}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2.8, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ margin: -5, border: '1px solid rgba(167,139,250,0.35)' }}
                  animate={{ scale: [1, 1.15, 1], opacity: [0.8, 0.1, 0.8] }}
                  transition={{ duration: 2.2, repeat: Infinity, delay: 0.4 }}
                />
                <motion.div
                  className="relative w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    background: 'radial-gradient(circle at 35% 35%, rgba(167,139,250,0.3), rgba(0,0,0,0.85))',
                    border: '1.5px solid rgba(167,139,250,0.55)',
                    boxShadow: '0 0 24px rgba(167,139,250,0.35)',
                  }}
                  animate={{ boxShadow: ['0 0 12px rgba(167,139,250,0.2)', '0 0 28px rgba(167,139,250,0.5)', '0 0 12px rgba(167,139,250,0.2)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Mic className="w-5 h-5 text-violet-300" />
                </motion.div>
              </div>
              {/* Live waveform */}
              <div className="w-full px-2">
                <LiveWaveform color="linear-gradient(to top, #6366f1, #a78bfa)" />
              </div>
              {/* Recording indicator */}
              <div className="flex items-center gap-1.5 text-[10px] font-mono" style={{ color: 'rgba(167,139,250,0.75)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                LIVE INTERVIEW · 00:14
              </div>
            </div>
            <div className="px-5 pb-5">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full mb-3" style={{ background: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.25)' }}>
                <Mic className="w-3 h-3" /> Voice AI
              </div>
              <h3 className="text-white font-semibold text-[15px] mb-1.5">AI-Speech Interviews</h3>
              <p className="text-white/38 text-[12px] leading-relaxed">Natural voice AI conducts adaptive interviews in real-time. Dynamic follow-ups, live scoring, and voice analysis throughout.</p>
            </div>
          </motion.div>
        </div>


        {/* Bottom divider */}
        <div className="flex items-center gap-3 mt-16">
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.08))' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50" />
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(255,255,255,0.08))' }} />
        </div>
      </div>
    </section>
  );
}
