'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Brain,
  ArrowLeft,
  Download,
  Share2,
  Printer,
  Check,
  AlertTriangle,
  Clock,
  Eye,
  Mic,
  BarChart3,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Star,
  Shield,
  FileText,
  Activity,
  User,
  Calendar,
  Building2,
  Timer,
  TrendingUp,
  X,
} from 'lucide-react';

// ─────────────────────────────────────────────
// WAVEFORM DATA (precomputed, no hydration issues)
// ─────────────────────────────────────────────
const WAVEFORM = Array.from({ length: 110 }, (_, i) =>
  Math.round(4 + Math.abs(Math.sin(i * 0.31) * 26) + Math.abs(Math.sin(i * 0.72) * 16) + Math.abs(Math.sin(i * 1.15) * 10))
);

// ─────────────────────────────────────────────
// SCORE GAUGE (SVG — animated)
// ─────────────────────────────────────────────
function ScoreGauge({ score, size = 140 }: { score: number; size?: number }) {
  const radius = 52;
  const circ = 2 * Math.PI * radius;
  const filled = (score / 100) * circ;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Outer glow ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{ boxShadow: '0 0 40px 8px rgba(99,102,241,0.18)', borderRadius: '50%' }}
      />
      <svg width={size} height={size} viewBox="0 0 120 120" className="-rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
        <motion.circle
          cx="60" cy="60" r={radius}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={{ strokeDasharray: `${filled} ${circ - filled}` }}
          transition={{ duration: 1.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-3xl font-bold text-white"
          style={{ fontFamily: 'var(--font-syne)' }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {score}
        </motion.span>
        <span className="text-xs text-gray-500">/100</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SCORE BAR
// ─────────────────────────────────────────────
function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-400">{label}</span>
        <span className="text-sm font-bold text-white">{score}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// REPORT PAGE
// ─────────────────────────────────────────────
export default function ReportPage() {
  const [activeTab, setActiveTab] = useState<'summary' | 'questions' | 'proctoring' | 'voice'>('summary');
  const [shareToast, setShareToast] = useState(false);

  const candidate = {
    name: 'Ahmed Khan',
    role: 'Senior Frontend Engineer',
    company: 'TechCorp Solutions',
    date: 'Dec 15, 2024',
    duration: '47 min',
    sessionId: 'IH-2024-0847',
    overallScore: 87,
    verdict: 'STRONGLY RECOMMENDED',
    verdictColor: 'emerald',
  };

  const dimensions = [
    { label: 'Technical Competency', score: 86, color: 'bg-indigo-500' },
    { label: 'Communication Skills', score: 93, color: 'bg-emerald-500' },
    { label: 'Problem-Solving Ability', score: 79, color: 'bg-purple-500' },
    { label: 'Professionalism', score: 95, color: 'bg-cyan-500' },
    { label: 'Cultural Fit Signals', score: 88, color: 'bg-amber-500' },
  ];

  const questions = [
    {
      q: 'Tell me about a time you resolved a production incident under pressure.',
      answer:
        'I was on-call when our payment gateway went down on a Friday evening during peak traffic. I isolated the issue to a misconfigured rate limiter following a deployment. Rolled back the config, added monitoring alerts, and wrote an incident report. Resolved in under 30 minutes.',
      score: 9.1,
      tags: ['Problem-Solving', 'Communication', 'Technical'],
      insight:
        "Excellent structured response using STAR method. Demonstrated clear ownership mentality and post-incident learning. Specific technical details (rate limiter, config rollback) show genuine experience rather than rehearsed answer.",
      sentiment: 'Confident',
      keywords: ['ownership', 'systematic', 'technical depth'],
    },
    {
      q: 'How do you approach state management in large-scale React applications?',
      answer:
        'I evaluate requirements first — for simple cases, Context + useReducer works well. For complex async state with caching needs, I prefer Zustand or TanStack Query depending on whether it\'s server or client state. I try to avoid premature optimisation.',
      score: 8.7,
      tags: ['Technical', 'Architecture'],
      insight:
        "Strong architectural reasoning with clear opinionated stances backed by trade-off analysis. Mentions avoiding premature optimisation which shows maturity. Could elaborate more on team knowledge considerations.",
      sentiment: 'Articulate',
      keywords: ['architectural thinking', 'pragmatic', 'trade-offs'],
    },
    {
      q: 'Describe a situation where you had to push back on a product decision.',
      answer:
        'Our PM wanted to ship a feature without performance testing. I shared data showing the same pattern had caused a 40% bounce rate increase previously on a similar feature. We agreed on a limited A/B rollout with perf monitoring first.',
      score: 9.3,
      tags: ['Communication', 'Influence', 'Professionalism'],
      insight:
        "Exceptional answer demonstrating data-driven advocacy, cross-functional communication skills, and collaborative conflict resolution. The use of historical data to build consensus is a strong signal of maturity.",
      sentiment: 'Calm & Assertive',
      keywords: ['data-driven', 'influence', 'collaborative'],
    },
  ];

  const proctoring = {
    status: 'PASSED',
    score: 96,
    events: [
      { time: '00:02:14', type: 'ok', label: 'Session verified — candidate identity confirmed' },
      { time: '00:07:41', label: 'Gaze pattern analysis — sustained focus detected', type: 'ok' },
      { time: '00:18:03', label: 'Tab switch event (1 occurrence, 2 seconds)', type: 'warn' },
      { time: '00:29:17', label: 'No secondary devices detected in frame', type: 'ok' },
      { time: '00:38:52', label: 'Gaze analysis complete — 94% on-screen focus', type: 'ok' },
      { time: '00:45:11', label: 'Session completed normally', type: 'ok' },
    ],
    metrics: [
      { label: 'On-Screen Gaze', value: '94%', ok: true },
      { label: 'Multiple Faces', value: 'None', ok: true },
      { label: 'Device Violations', value: 'None', ok: true },
      { label: 'Tab Switches', value: '1 (minor)', ok: false },
      { label: 'Audio Anomalies', value: 'None', ok: true },
      { label: 'Frame Coverage', value: '98%', ok: true },
    ],
  };

  const voice = {
    clarity: 89,
    confidence: 92,
    pace: 'Optimal',
    paceWpm: 142,
    hesitations: 4,
    fillerWords: 6,
    avgResponseTime: '2.3s',
    totalSpeakTime: '38 min',
    insights: [
      'Consistent vocal clarity throughout the session with no degradation',
      'Response cadence indicates structured thinking before articulating',
      'Minimal filler word usage (6 instances across 47 minutes) is well below average',
      'Confidence levels remained high even during challenging technical questions',
    ],
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
  };

  const tabs = [
    { id: 'summary', label: 'Executive Summary', icon: BarChart3 },
    { id: 'questions', label: 'Q&A Breakdown', icon: MessageSquare },
    { id: 'proctoring', label: 'Proctoring Report', icon: Eye },
    { id: 'voice', label: 'Voice Analysis', icon: Mic },
  ] as const;

  return (
    <div className="min-h-screen bg-[#030712] text-white relative overflow-x-hidden">
      {/* ── Fixed ambient background ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1100px] h-[700px]"
          style={{ background: 'radial-gradient(ellipse 65% 55% at 50% 0%, rgba(99,102,241,0.18) 0%, transparent 70%)' }} />
        <div className="absolute top-[30%] -left-48 w-[520px] h-[520px]"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 65%)' }} />
        <div className="absolute top-[60%] -right-48 w-[520px] h-[520px]"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 65%)' }} />
        <div className="absolute inset-0 opacity-[0.016]"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      </div>
      {/* Share toast */}
      {shareToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium shadow-2xl">
          <Check className="w-4 h-4" />
          Link copied to clipboard
        </div>
      )}

      {/* TOP BAR */}
      <div className="sticky top-0 z-40 bg-[#030712]/90 backdrop-blur-2xl border-b border-white/[0.06] relative">
        {/* Bottom glow accent */}
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent 5%, rgba(99,102,241,0.4) 35%, rgba(16,185,129,0.25) 65%, transparent 95%)' }} />
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Back to IntelliHire
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Brain className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-syne)' }}>
                Intelli<span className="text-indigo-400">Hire</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden md:block text-xs text-gray-600 bg-white/[0.03] border border-white/[0.06] px-3 py-1.5 rounded-full font-mono">
              SAMPLE REPORT · {candidate.sessionId}
            </span>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-gray-400 border border-white/[0.07] hover:bg-white/[0.05] hover:text-white transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-gray-400 border border-white/[0.07] hover:bg-white/[0.05] hover:text-white transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 transition-colors">
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 relative z-10">
        {/* CANDIDATE HERO */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          {/* Candidate info */}
          <div className="md:col-span-2 p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] relative overflow-hidden">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, rgba(99,102,241,0.7) 0%, rgba(16,185,129,0.4) 50%, transparent 100%)' }} />
            {/* Avatar area glow */}
            <div className="absolute -top-6 -left-6 w-36 h-36" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-emerald-500/30 border border-white/10 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-syne)' }}>
                  AK
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-syne)' }}>
                    {candidate.name}
                  </h1>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {candidate.verdict}
                  </span>
                </div>
                <p className="text-gray-400 mb-4">{candidate.role}</p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" /> {candidate.company}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> {candidate.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Timer className="w-3.5 h-3.5" /> {candidate.duration}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> #{candidate.sessionId}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Score */}
          <div className="p-6 rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.04] flex flex-col items-center justify-center gap-3 relative overflow-hidden">
            {/* Radial glow behind gauge */}
            <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 45%, rgba(99,102,241,0.12) 0%, transparent 65%)' }} />
            <ScoreGauge score={candidate.overallScore} />
            <div className="text-center">
              <div className="text-xs text-gray-600 uppercase tracking-widest">Overall Score</div>
              <div className="text-xs text-emerald-400 font-semibold mt-0.5">Top 15% of candidates</div>
            </div>
          </div>
        </motion.div>

        {/* QUICK STATS */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Proctoring', value: 'PASSED', sub: '1 minor event', icon: Shield, color: 'emerald' },
            { label: 'Voice Clarity', value: '89%', sub: 'Above average', icon: Mic, color: 'indigo' },
            { label: 'Avg. Response', value: '2.3s', sub: 'Think time', icon: Clock, color: 'purple' },
            { label: 'Confidence', value: '92%', sub: 'Consistent', icon: TrendingUp, color: 'cyan' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className={`p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] transition-colors relative overflow-hidden`}
            >
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right, rgba(var(--${stat.color}-rgb, 99,102,241), 0.5), transparent)` }} />
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 text-${stat.color}-400`} />
                <span className="text-[11px] text-gray-600 uppercase tracking-wider">{stat.label}</span>
              </div>
              <div
                className={`text-xl font-bold text-${stat.color}-400 mb-0.5`}
                style={{ fontFamily: 'var(--font-syne)' }}
              >
                {stat.value}
              </div>
              <div className="text-[11px] text-gray-600">{stat.sub}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* TABS */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="flex gap-1 mb-8 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-1.5"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </motion.div>

        {/* TAB CONTENT */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* ── EXECUTIVE SUMMARY ── */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              {/* Dimension scores */}
              <div className="p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
                <h2 className="text-base font-bold mb-6" style={{ fontFamily: 'var(--font-syne)' }}>
                  Assessment Dimensions
                </h2>
                <div className="space-y-5">
                  {dimensions.map((d) => (
                    <ScoreBar key={d.label} label={d.label} score={d.score} color={d.color} />
                  ))}
                </div>
              </div>

              {/* AI Narrative */}
              <div className="p-6 rounded-2xl border border-indigo-500/15 bg-indigo-500/[0.04]">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-4 h-4 text-indigo-400" />
                  <h2 className="text-base font-bold" style={{ fontFamily: 'var(--font-syne)' }}>
                    AI Assessment Narrative
                  </h2>
                  <span className="text-[10px] text-indigo-400/60 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/15 ml-auto">
                    GPT-4o · RAG-augmented
                  </span>
                </div>
                <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
                  <p>
                    Ahmed demonstrated strong, well-rounded capabilities across the assessed dimensions. His technical
                    answers reflected genuine hands-on experience rather than theoretical knowledge — evidenced by
                    the specificity of production incident responses and architectural trade-off discussions.
                  </p>
                  <p>
                    Communication throughout the session was articulate and consistently professional. Ahmed structures
                    responses clearly, using a natural STAR-adjacent framework without it feeling rehearsed. He showed
                    a notable ability to distil complex technical concepts into digestible explanations.
                  </p>
                  <p>
                    The single minor proctoring flag (tab-switch at 18:03, 2 seconds) is well within acceptable
                    parameters and does not raise integrity concerns. Overall, this candidate ranks in the top 15% of
                    profiles evaluated by IntelliHire for senior frontend engineering roles.
                  </p>
                </div>
              </div>

              {/* Recommendation */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04]">
                  <h2 className="text-base font-bold mb-4 text-emerald-400" style={{ fontFamily: 'var(--font-syne)' }}>
                    Recommendation
                  </h2>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
                      <Check className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="font-bold text-white">Proceed to Technical Round</div>
                      <div className="text-xs text-gray-500">AI Confidence: High</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">
                    Strong communication, relevant technical depth, and clean proctoring record. Recommend a focused
                    live coding session to validate hands-on skills.
                  </p>
                </div>

                <div className="p-6 rounded-2xl border border-amber-500/15 bg-amber-500/[0.03]">
                  <h2 className="text-base font-bold mb-4 text-amber-400" style={{ fontFamily: 'var(--font-syne)' }}>
                    Areas to Probe Further
                  </h2>
                  <ul className="space-y-2.5">
                    {[
                      'Deep dive into system design at scale (mentioned limited)',
                      'Testing philosophy and coverage practices',
                      'Mentorship / team leadership experience',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ── Q&A BREAKDOWN ── */}
          {activeTab === 'questions' && (
            <div className="space-y-5">
              {questions.map((q, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02]"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-7 h-7 rounded-xl bg-indigo-500/15 text-indigo-400 text-xs font-bold flex items-center justify-center">
                        Q{i + 1}
                      </span>
                      <h3 className="text-sm font-semibold text-white leading-snug">{q.q}</h3>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-xl font-bold text-indigo-400" style={{ fontFamily: 'var(--font-syne)' }}>
                        {q.score}
                        <span className="text-sm text-gray-600">/10</span>
                      </div>
                      <div className="flex mt-1 justify-end">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${star <= Math.round(q.score / 2) ? 'text-amber-400 fill-amber-400' : 'text-gray-700'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Candidate answer */}
                  <div className="p-4 rounded-xl bg-white/[0.025] border border-white/[0.05] mb-4">
                    <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-2">Candidate Response (Transcript)</div>
                    <p className="text-sm text-gray-300 leading-relaxed italic">"{q.answer}"</p>
                  </div>

                  {/* AI insight */}
                  <div className="p-4 rounded-xl bg-indigo-500/[0.05] border border-indigo-500/10 mb-3">
                    <div className="flex items-center gap-1.5 text-[10px] text-indigo-400 font-semibold uppercase tracking-wider mb-2">
                      <Brain className="w-3 h-3" /> AI Analysis
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{q.insight}</p>
                  </div>

                  {/* Tags + sentiment */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] text-gray-600">Detected:</span>
                    {q.keywords.map((k) => (
                      <span key={k} className="text-[10px] bg-white/[0.04] border border-white/[0.07] text-gray-400 px-2 py-0.5 rounded-full">
                        {k}
                      </span>
                    ))}
                    <span className="ml-auto text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-2 py-0.5 rounded-full font-medium">
                      Sentiment: {q.sentiment}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── PROCTORING REPORT ── */}
          {activeTab === 'proctoring' && (
            <div className="space-y-6">
              {/* Status header */}
              <div className="flex items-center justify-between p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04]">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
                    <Shield className="w-7 h-7 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-[11px] text-emerald-400/70 uppercase tracking-wider">Integrity Status</div>
                    <div className="text-2xl font-bold text-emerald-400" style={{ fontFamily: 'var(--font-syne)' }}>
                      {proctoring.status}
                    </div>
                    <div className="text-xs text-gray-500">Proctoring Score: {proctoring.score}/100</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-bold" style={{ fontFamily: 'var(--font-syne)' }}>
                    <span className="text-emerald-400">{proctoring.score}</span>
                    <span className="text-gray-600 text-2xl">/100</span>
                  </div>
                  <div className="text-xs text-gray-600">Integrity score</div>
                </div>
              </div>

              {/* Metrics grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {proctoring.metrics.map((m) => (
                  <div
                    key={m.label}
                    className={`p-4 rounded-2xl border ${
                      m.ok ? 'border-emerald-500/15 bg-emerald-500/[0.03]' : 'border-amber-500/15 bg-amber-500/[0.03]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">{m.label}</span>
                      {m.ok ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                    <div className={`text-base font-bold ${m.ok ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Event timeline */}
              <div className="p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
                <h2 className="text-base font-bold mb-5" style={{ fontFamily: 'var(--font-syne)' }}>
                  Session Timeline
                </h2>
                <div className="space-y-3">
                  {proctoring.events.map((ev, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-2.5 h-2.5 rounded-full mt-1.5 ${ev.type === 'ok' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                      <div className="flex-1 flex items-center justify-between gap-4">
                        <p className={`text-sm ${ev.type === 'ok' ? 'text-gray-400' : 'text-amber-300'}`}>
                          {ev.label}
                        </p>
                        <span className="text-xs text-gray-600 font-mono flex-shrink-0">{ev.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── VOICE ANALYSIS ── */}
          {activeTab === 'voice' && (
            <div className="space-y-6">
              {/* Core metrics */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] space-y-5">
                  <h2 className="text-base font-bold" style={{ fontFamily: 'var(--font-syne)' }}>
                    Speech Quality Metrics
                  </h2>
                  <ScoreBar label="Vocal Clarity" score={voice.clarity} color="bg-indigo-500" />
                  <ScoreBar label="Confidence Level" score={voice.confidence} color="bg-emerald-500" />
                  <ScoreBar label="Articulation Score" score={91} color="bg-purple-500" />
                  <ScoreBar label="Emotional Stability" score={88} color="bg-cyan-500" />
                </div>

                <div className="p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
                  <h2 className="text-base font-bold mb-5" style={{ fontFamily: 'var(--font-syne)' }}>
                    Session Statistics
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Speaking Pace', value: `${voice.paceWpm} WPM`, note: 'Optimal (120-160)' },
                      { label: 'Total Speak Time', value: voice.totalSpeakTime, note: 'of 47 min session' },
                      { label: 'Avg Response Time', value: voice.avgResponseTime, note: 'Structured thinking' },
                      { label: 'Hesitations', value: voice.hesitations.toString(), note: 'Below average (9 avg)' },
                      { label: 'Filler Words', value: voice.fillerWords.toString(), note: '"um", "like" etc.' },
                      { label: 'Pace Variation', value: 'Natural', note: 'No monotone detected' },
                    ].map((stat) => (
                      <div key={stat.label} className="p-3 rounded-xl bg-white/[0.025] border border-white/[0.05]">
                        <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">{stat.label}</div>
                        <div className="text-base font-bold text-white" style={{ fontFamily: 'var(--font-syne)' }}>
                          {stat.value}
                        </div>
                        <div className="text-[10px] text-gray-600">{stat.note}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Waveform Visualization ── */}
              <div className="p-6 rounded-2xl border border-indigo-500/15 bg-white/[0.015] mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Mic className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-bold">Vocal Waveform Reconstruction</span>
                  <span className="ml-auto text-[10px] text-gray-600 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06]">47 min session</span>
                </div>
                <div className="flex items-end justify-center gap-[2px] h-[72px] overflow-hidden">
                  {WAVEFORM.map((h, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 max-w-[5px] rounded-full"
                      style={{
                        background: i % 4 === 0
                          ? 'rgba(99,102,241,0.95)'
                          : i % 4 === 1
                          ? 'rgba(16,185,129,0.7)'
                          : i % 4 === 2
                          ? 'rgba(99,102,241,0.5)'
                          : 'rgba(99,102,241,0.3)',
                      }}
                      initial={{ height: 2, opacity: 0 }}
                      animate={{ height: h, opacity: 1 }}
                      transition={{ delay: 0.015 * i, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    />
                  ))}
                </div>
              </div>

              {/* Voice insights */}
              <div className="p-6 rounded-2xl border border-indigo-500/15 bg-indigo-500/[0.04]">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-4 h-4 text-indigo-400" />
                  <h2 className="text-base font-bold" style={{ fontFamily: 'var(--font-syne)' }}>
                    AI Voice Insights
                  </h2>
                </div>
                <ul className="space-y-3">
                  {voice.insights.map((insight, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-500/15 flex items-center justify-center mt-0.5">
                        <Activity className="w-3 h-3 text-indigo-400" />
                      </div>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </motion.div>

        {/* FOOTER NOTE */}
        <div className="mt-12 pt-8 border-t border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white" style={{ fontFamily: 'var(--font-syne)' }}>
                Intelli<span className="text-indigo-400">Hire</span>
              </p>
              <p className="text-[10px] text-gray-600">AI-Powered Candidate Screening · Built at FAST NUCES</p>
            </div>
          </div>
          <p className="text-[10px] text-gray-700 text-center">
            This is a sample/mock report for demonstration purposes only. Real candidate data will be securely processed and stored per our privacy policy.
          </p>
          <p className="text-[10px] text-gray-700">
            Session #{candidate.sessionId} · {candidate.date}
          </p>
        </div>
      </div>
    </div>
  );
}
