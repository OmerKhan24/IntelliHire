'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Link2,
  Filter,
  Mic,
  Calendar,
  Eye,
  BarChart3,
  Brain,
} from 'lucide-react';
import { SpotlightCard } from '@/components/ui/spotlight-card';

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-28 px-6 bg-black overflow-hidden">
      {/* Section spotlight glow */}
      <div className="section-spotlight-features absolute inset-0 w-full h-full pointer-events-none" />
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-5 py-2.5 mb-5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm font-medium [box-shadow:0_4px_20px_rgba(47,151,247,0.2),inset_0_-1px_0_rgba(47,151,247,0.6)]">
            <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
            Capabilities
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="text-5xl md:text-6xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Everything built-in.{' '}
            <span className="text-gradient-blue-purple">Nothing to set up.</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-slate-400 max-w-xl mx-auto">
            Six AI-powered modules working together so your entire initial hiring pipeline takes
            hours, not months.
          </motion.p>
        </motion.div>

        {/* ─── BENTO GRID ─────────────────────────────────── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {/* ── ROW 1 ── */}

          {/* BIG CARD: Pipeline Automation (col-span-2) */}
          <motion.div variants={fadeUp} className="md:col-span-2">
            <SpotlightCard
              className="bg-slate-900/70 rounded-3xl border border-slate-700/50 backdrop-blur-sm p-7 overflow-hidden h-full hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300"
              spotlightColor="rgba(99,102,241,0.18)"
            >
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand bg-brand/10 border border-brand/30 px-3 py-1.5 rounded-full mb-5">
                <Zap className="w-3.5 h-3.5" />
                Full Pipeline Automation
              </div>
              <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                Post once. Screen everyone.
              </h3>
              <p className="text-sm text-slate-400 max-w-md mb-7">
                Share a single link. IntelliHire ingests every applicant, scores CVs, schedules
                interviews, and delivers ranked reports — completely hands-free.
              </p>
              <div className="flex items-center gap-2.5 flex-wrap">
                {[
                  { n: '247', l: 'Applied', bg: 'bg-slate-800', t: 'text-slate-200', b: 'border-slate-700' },
                  { n: '→', l: '', bg: '', t: 'text-slate-600', b: '' },
                  { n: '89', l: 'CV Pass', bg: 'bg-blue-500/10', t: 'text-blue-300', b: 'border-blue-500/30' },
                  { n: '→', l: '', bg: '', t: 'text-slate-600', b: '' },
                  { n: '34', l: 'Scheduled', bg: 'bg-violet-500/10', t: 'text-violet-300', b: 'border-violet-500/30' },
                  { n: '→', l: '', bg: '', t: 'text-slate-600', b: '' },
                  { n: '8', l: 'Shortlist', bg: 'bg-emerald-500/10', t: 'text-emerald-300', b: 'border-emerald-500/30' },
                ].map((item, i) =>
                  item.l === '' ? (
                    <span key={i} className={`text-2xl font-light ${item.t}`}>{item.n}</span>
                  ) : (
                    <div key={i} className={`rounded-2xl border ${item.b} ${item.bg} px-4 py-3 text-center min-w-[76px]`}>
                      <div className={`text-2xl font-bold ${item.t}`} style={{ fontFamily: 'var(--font-display)' }}>
                        {item.n}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{item.l}</div>
                    </div>
                  )
                )}
              </div>
            </SpotlightCard>
          </motion.div>

          {/* CARD: Share Link (col-span-1) */}
          <motion.div variants={fadeUp}>
            <SpotlightCard
              className="bg-slate-900/70 rounded-3xl border border-slate-700/50 backdrop-blur-sm p-7 flex flex-col gap-5 h-full hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
              spotlightColor="rgba(59,130,246,0.18)"
            >
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-3 py-1.5 rounded-full mb-5">
                  <Link2 className="w-3.5 h-3.5" />
                  One Link
                </div>
                <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                  Share Everywhere
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Post to LinkedIn, paste in emails, drop in WhatsApp. One link handles
                  registrations, CV uploads, and scheduling.
                </p>
              </div>
              <div className="mt-auto space-y-3">
                <div className="bg-brand/10 border border-brand/30 rounded-xl p-3 font-mono text-sm text-brand font-semibold text-center tracking-tight">
                  ih.app/j/senior-fe-01
                </div>
                <div className="flex gap-2 justify-center">
                  {['LinkedIn', 'Email', 'WhatsApp'].map((p) => (
                    <span key={p} className="text-[10px] bg-slate-800 border border-slate-700 text-slate-400 px-2.5 py-1.5 rounded-full font-medium">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* ── ROW 2 ── */}

          {/* CARD: ATS CV Scoring (col-span-1) */}
          <motion.div variants={fadeUp}>
            <SpotlightCard
              className="bg-slate-900/70 rounded-3xl border border-slate-700/50 backdrop-blur-sm p-7 h-full hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300"
              spotlightColor="rgba(124,58,237,0.18)"
            >
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-400 bg-violet-500/10 border border-violet-500/30 px-3 py-1.5 rounded-full mb-5">
                <Filter className="w-3.5 h-3.5" />
                ATS + AI
              </div>
              <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                AI Scores Every CV
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-5">
                ATS matching + RAG pipeline scores each CV against your criteria in seconds. No
                manual shortlisting.
              </p>
              <div className="space-y-2.5">
                {[
                  { name: 'Ahmed K.', score: 91, w: '91%', col: 'bg-emerald-400' },
                  { name: 'Sara M.', score: 87, w: '87%', col: 'bg-emerald-400' },
                  { name: 'Ali R.', score: 62, w: '62%', col: 'bg-amber-400' },
                  { name: 'Zara B.', score: 38, w: '38%', col: 'bg-red-400' },
                ].map((c) => (
                  <div key={c.name} className="flex items-center gap-2.5">
                    <span className="text-[10px] text-slate-500 w-14 flex-shrink-0">{c.name}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                      <div className={`h-full rounded-full ${c.col}`} style={{ width: c.w }} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 w-7 text-right">{c.score}</span>
                  </div>
                ))}
              </div>
            </SpotlightCard>
          </motion.div>

          {/* BIG CARD: AI Interview (col-span-2) */}
          <motion.div variants={fadeUp} className="md:col-span-2">
            <SpotlightCard
              className="bg-slate-900/70 rounded-3xl border border-slate-700/50 backdrop-blur-sm p-7 overflow-hidden h-full hover:shadow-xl hover:shadow-fuchsia-500/10 transition-all duration-300"
              spotlightColor="rgba(217,70,239,0.16)"
            >
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-fuchsia-400 bg-fuchsia-500/10 border border-fuchsia-500/30 px-3 py-1.5 rounded-full mb-5">
                <Mic className="w-3.5 h-3.5" />
                Voice AI Interviews
              </div>
              <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                AI conducts the interview
              </h3>
              <p className="text-sm text-slate-400 max-w-md mb-6">
                Natural voice conversation. Dynamic follow-ups adapt based on candidate responses.
                Scored on technical depth, communication, and confidence in real-time.
              </p>
              {/* Interview UI */}
              <div className="bg-slate-800/80 rounded-2xl border border-slate-700/50 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center flex-shrink-0">
                    <Brain className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-slate-700/60 rounded-xl px-3.5 py-2.5 border border-slate-600/50 text-xs text-slate-200 max-w-sm shadow-sm leading-relaxed">
                    "Tell me about a time you led a project under tight deadlines. What was your approach and outcome?"
                  </div>
                </div>
                <div className="flex justify-end items-end gap-3">
                  <div className="bg-brand/15 rounded-xl px-3.5 py-2.5 border border-brand/30 text-xs text-brand/80 max-w-xs leading-relaxed">
                    "In my previous role, I managed a 3-week sprint..."
                    <div className="flex items-end gap-[2px] mt-2 h-5">
                      {Array.from({ length: 22 }).map((_, j) => (
                        <div key={j} className="flex-1 rounded-full bg-brand/70" style={{ height: `${4 + ((j * 5 + 2) % 12)}px` }} />
                      ))}
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 text-[9px] font-bold text-slate-300">
                    AK
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-4">
                    {[
                      { l: 'Clarity', v: '89%', col: 'text-brand' },
                      { l: 'Confidence', v: '92%', col: 'text-emerald-400' },
                      { l: 'Pace', v: 'Good', col: 'text-violet-400' },
                    ].map((m) => (
                      <div key={m.l} className="text-center">
                        <div className={`text-xs font-bold ${m.col}`}>{m.v}</div>
                        <div className="text-[9px] text-slate-400">{m.l}</div>
                      </div>
                    ))}
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    Recording 12:47
                  </div>
                </div>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* ── ROW 3 ── */}

          {/* CARD: Zero Scheduling (col-span-1) */}
          <motion.div variants={fadeUp}>
            <SpotlightCard
              className="bg-slate-900/70 rounded-3xl border border-slate-700/50 backdrop-blur-sm p-7 h-full hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300"
              spotlightColor="rgba(147,51,234,0.18)"
            >
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/30 px-3 py-1.5 rounded-full mb-5">
                <Calendar className="w-3.5 h-3.5" />
                Smart Scheduler
              </div>
              <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                Zero-HR Scheduling
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-5">
                Automated emails invite shortlisted candidates to self-schedule. No email chains. No missed slots.
              </p>
              <div className="bg-slate-800/80 rounded-xl border border-slate-700/50 p-3">
                <div className="text-[10px] font-semibold text-slate-400 mb-2.5">Available — Mon Apr 7</div>
                <div className="grid grid-cols-3 gap-1.5">
                  {['9:00', '10:30', '11:00', '14:00', '15:30', '16:00'].map((t, j) => (
                    <div
                      key={t}
                      className={`text-center py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                        j === 1
                          ? 'bg-brand text-white shadow-sm'
                          : j === 3
                          ? 'bg-slate-700 text-slate-600 line-through'
                          : 'bg-slate-700/60 border border-slate-600/50 text-slate-400'
                      }`}
                    >
                      {t}
                    </div>
                  ))}
                </div>
                <div className="mt-2.5 text-center text-[9px] text-brand font-medium">
                  Sara Malik booked 10:30 ✓
                </div>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* CARD: Proctoring (col-span-2) */}
          <motion.div variants={fadeUp} className="md:col-span-2">
            <SpotlightCard
              className="bg-slate-900/70 rounded-3xl border border-slate-700/50 backdrop-blur-sm p-7 h-full hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300"
              spotlightColor="rgba(245,158,11,0.16)"
            >
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full mb-5">
                <Eye className="w-3.5 h-3.5" />
                YOLOv8 Proctoring
              </div>
              <div className="grid md:grid-cols-2 gap-6 items-start">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                    Zero Cheating
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-5">
                    Real-time gaze detection, face monitoring, device checks, and tab-switch flags
                    throughout every interview session.
                  </p>
                  <div className="space-y-2">
                    {[
                      { label: 'Gaze Detection', icon: '👁', col: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
                      { label: 'Multi-face Alert', icon: '👥', col: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
                      { label: 'Tab-switch Flags', icon: '🔒', col: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
                      { label: 'Device Monitoring', icon: '💻', col: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
                    ].map((item) => (
                      <div key={item.label} className={`inline-flex items-center gap-2 text-[11px] font-medium px-3 py-1.5 rounded-full border mr-2 mb-1 ${item.col}`}>
                        <span>{item.icon}</span> {item.label}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative bg-slate-900 rounded-2xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-24 h-28 border-2 border-emerald-400 rounded-sm">
                      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full border border-emerald-400/60" />
                      </div>
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] text-emerald-400 font-mono whitespace-nowrap">
                        FACE DETECTED
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 text-[8px] text-emerald-400 font-mono">
                    ✓ gaze ok · ✓ 1 face · ✓ clean
                  </div>
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[8px] text-white font-mono">REC</span>
                  </div>
                  {/* scan line */}
                  <div className="absolute left-0 right-0 h-px bg-emerald-400/40 animate-scan" />
                </div>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* ── ROW 4: Full-width Ranked Reports ── */}
          <motion.div variants={fadeUp} className="md:col-span-3">
            <SpotlightCard
              className="bg-brand/10 border border-brand/25 rounded-3xl p-7 md:p-9 h-full hover:bg-brand/15 transition-colors duration-300"
              spotlightColor="rgba(255,255,255,0.12)"
            >
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand/80 bg-brand/10 border border-brand/25 px-3 py-1.5 rounded-full mb-5">
                    <BarChart3 className="w-3.5 h-3.5" />
                    Instant Reports
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                    Ranked. Detailed. Delivered instantly.
                  </h3>
                  <p className="text-sm text-white/55 max-w-md leading-relaxed">
                    Every interview generates a comprehensive AI report — scores, transcript, behavior
                    analysis, proctoring log, and hire recommendation. Ranked automatically.
                  </p>
                </div>
                <div className="flex-1 grid grid-cols-3 gap-3 w-full">
                  {[
                    { name: 'Ahmed Khan', score: 91, rank: '#1', rec: 'Strong Hire', bar: '91%' },
                    { name: 'Sara Malik', score: 87, rank: '#2', rec: 'Hire', bar: '87%' },
                    { name: 'Bilal Shah', score: 74, rank: '#3', rec: 'Consider', bar: '74%' },
                  ].map((c, i) => (
                    <div key={i} className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-brand/70">{c.rank}</span>
                        <span className="text-[10px] font-bold text-white">{c.score}%</span>
                      </div>
                      <div className="text-xs font-semibold text-white mb-1 leading-tight">{c.name}</div>
                      <div className="text-[9px] text-brand/70 mb-2">{c.rec}</div>
                      <div className="h-1 rounded-full bg-white/20 overflow-hidden">
                        <div className="h-full rounded-full bg-white/60" style={{ width: c.bar }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SpotlightCard>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
