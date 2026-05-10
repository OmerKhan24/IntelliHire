'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, UserX, DollarSign, AlertTriangle, ArrowUpRight, ArrowRight, BarChart2, ShieldOff } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const problems = [
  {
    icon: Clock,
    iconBg: 'rgba(239,68,68,0.15)',
    iconColor: '#f87171',
    title: 'Weeks lost to CV screening',
    subtitle: 'Manual Filtering',
    desc: 'HR teams spend 20+ hours reviewing CVs for a single role. Most are disqualified at the first interview anyway — that time was wasted.',
    stat: '20 hrs/role',
  },
  {
    icon: UserX,
    iconBg: 'rgba(234,179,8,0.15)',
    iconColor: '#facc15',
    title: 'Dangerously small sample size',
    subtitle: 'Candidate Pool',
    desc: 'Traditional hiring means you only interview 10–15 candidates. The ideal hire might have been #47. You simply never see them.',
    stat: 'Miss 80% pool',
  },
  {
    icon: DollarSign,
    iconBg: 'rgba(16,185,129,0.15)',
    iconColor: '#34d399',
    title: 'Scheduling is a 3-week nightmare',
    subtitle: 'Coordination Cost',
    desc: 'Endless email chains to coordinate interviews. Candidates drop out. Slots get missed. Competitors with faster pipelines close them first.',
    stat: '3–14 day delay',
  },
  {
    icon: AlertTriangle,
    iconBg: 'rgba(249,115,22,0.15)',
    iconColor: '#fb923c',
    title: 'Inconsistent and biased decisions',
    subtitle: 'Human Bias',
    desc: 'Different interviewers ask different questions. Results vary by mood, time of day, gut feeling. No consistency. No way to compare fairly.',
    stat: '80% subjective',
  },
  {
    icon: BarChart2,
    iconBg: 'rgba(139,92,246,0.15)',
    iconColor: '#a78bfa',
    title: 'No data to learn from',
    subtitle: 'Zero Analytics',
    desc: 'Most companies have no structured data on past hires. They repeat the same mistakes each cycle with zero feedback loop or improvement.',
    stat: 'No metrics',
  },
  {
    icon: ShieldOff,
    iconBg: 'rgba(236,72,153,0.15)',
    iconColor: '#f472b6',
    title: 'Compliance and audit risk',
    subtitle: 'Legal Exposure',
    desc: 'Undocumented interview processes expose companies to discrimination claims. Without structured records, there is no evidence of fair practice.',
    stat: 'High liability',
  },
];

export function ProblemSection() {
  return (
    <section id="problem" className="relative py-28 px-6 bg-black overflow-hidden">
      {/* Background atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Central top glow */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[820px] h-[460px]"
          style={{ background: 'radial-gradient(ellipse 60% 55% at 50% 0%, rgba(37,99,235,0.18) 0%, transparent 70%)' }} />
        {/* Left bleed glow — warm red tint */}
        <div className="absolute top-0 -left-40 w-[500px] h-[400px]"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 20% 30%, rgba(239,68,68,0.07) 0%, transparent 70%)' }} />
        {/* Right bleed glow — orange tint */}
        <div className="absolute top-0 -right-40 w-[500px] h-[400px]"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 80% 30%, rgba(249,115,22,0.07) 0%, transparent 70%)' }} />
        {/* Horizontal grid lines — subtle depth */}
        <div className="absolute top-0 left-0 right-0 bottom-0 opacity-[0.03]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, white 0px, white 1px, transparent 1px, transparent 80px)', backgroundSize: '100% 80px' }} />
        {/* Bottom fade to black */}
        <div className="absolute bottom-0 left-0 right-0 h-40"
          style={{ background: 'linear-gradient(to top, #000 0%, transparent 100%)' }} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* ── Heading ── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="text-center mb-16"
        >
          {/* Vertical connector */}
          <motion.div variants={fadeUp} className="flex flex-col items-center mb-3">
            <div style={{ width: 1, height: 48, background: 'linear-gradient(to bottom, transparent, rgba(47,151,247,0.7))' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-brand)', boxShadow: '0 0 14px 4px rgba(47,151,247,0.55)', marginTop: 3 }} />
          </motion.div>

          {/* Badge with flanking lines */}
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px flex-1 max-w-[80px]"
              style={{ background: 'linear-gradient(to right, transparent, rgba(47,151,247,0.55))' }} />
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white text-sm font-medium tracking-wide uppercase"
              style={{ boxShadow: '0 4px_20px rgba(47,151,247,0.18), inset 0 -1px 0 rgba(47,151,247,0.5)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
              The Problem
            </div>
            <div className="h-px flex-1 max-w-[80px]"
              style={{ background: 'linear-gradient(to left, transparent, rgba(47,151,247,0.55))' }} />
          </motion.div>

          {/* Main heading */}
          <motion.h2
            variants={fadeUp}
            className="text-5xl md:text-[64px] font-bold leading-[1.08] tracking-tight mb-6 font-display"
          >
            <span className="text-white">Hiring is broken.</span>
            <br />
            <span style={{ background: 'linear-gradient(90deg, #f87171 0%, #fb923c 60%, #facc15 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Everyone just accepts it.
            </span>
          </motion.h2>

          {/* Subtext */}
          <motion.p variants={fadeUp} className="text-[17px] text-white/45 max-w-xl mx-auto leading-relaxed mb-10">
            Companies spend months doing what AI can automate in 48 hours — burning out HR teams,
            losing top talent, and repeating the same broken cycle every quarter.
          </motion.p>

          {/* Stat pills row */}
          <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-3 mb-10">
            {[
              { val: '23 days', label: 'avg. time-to-hire' },
              { val: '$4,700', label: 'avg. cost per hire' },
              { val: '75%', label: 'CVs never read' },
            ].map(({ val, label }) => (
              <div key={label} className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                <span className="text-sm font-bold text-red-400">{val}</span>
                <span className="text-xs text-white/35">{label}</span>
              </div>
            ))}
          </motion.div>

          {/* Bottom divider */}
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-3">
            <div className="h-px w-24" style={{ background: 'linear-gradient(to right, transparent, rgba(47,151,247,0.3))' }} />
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <div className="h-px w-24" style={{ background: 'linear-gradient(to left, transparent, rgba(47,151,247,0.3))' }} />
          </motion.div>
        </motion.div>

        {/* ── Cards grid ── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="grid md:grid-cols-3 gap-4 mb-14"
        >
          {problems.map((p, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="relative group rounded-2xl overflow-hidden flex flex-col"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                transition: 'border-color 0.3s, box-shadow 0.3s',
              }}
              whileHover={{ borderColor: 'rgba(255,255,255,0.16)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
                style={{ background: `linear-gradient(to right, transparent 10%, ${p.iconColor}55 50%, transparent 90%)` }} />

              {/* Arrow icon top-right */}
              <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-60 transition-opacity duration-300">
                <ArrowUpRight className="w-4 h-4 text-white" />
              </div>

              <div className="p-6 flex flex-col gap-4 flex-1">
                {/* Icon */}
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: p.iconBg, border: `1px solid ${p.iconColor}30` }}>
                  <p.icon className="w-5 h-5" style={{ color: p.iconColor }} />
                </div>

                {/* Title + subtitle + stat */}
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-bold text-white text-[15px] leading-snug">{p.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/35">{p.subtitle}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ color: p.iconColor, background: p.iconBg, border: `1px solid ${p.iconColor}30` }}>
                      {p.stat}
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.07)' }} />

                {/* Description */}
                <p className="text-sm text-white/45 leading-relaxed flex-1">{p.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Solution CTA */}
        {/* <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden bg-brand/10 border border-brand/25 rounded-3xl p-8 md:p-12 text-white text-center"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/60 to-transparent" />
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-32 bg-brand/10 blur-3xl rounded-full" />
          <h3 className="text-2xl md:text-3xl font-bold mb-3 relative z-10 font-display">
            IntelliHire turns months of work into 48 hours.
          </h3>
          <p className="text-white/60 text-base md:text-lg mb-6 max-w-2xl mx-auto relative z-10">
            One link handles everything — CV collection, ATS scoring, AI interviews, scheduling, and
            ranked shortlists. HR focuses on final decisions, not grunt work.
          </p>
          <a
            href="#how-it-works"
            className="relative z-10 inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-xl text-sm btn-primary"
          >
            See How It Works <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div> */}
      </div>
    </section>
  );
}
