'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Upload,
  Link2,
  Filter,
  Calendar,
  Mic,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';

const steps = [
  {
    num: '01', icon: Upload, title: 'Post Your Job',
    color: '#2f97f7', glow: 'rgba(47,151,247,0.28)',
    desc: 'Upload your job description, set scoring criteria, and choose how many final candidates you want ranked.',
    detail: 'Link in < 30s',
  },
  {
    num: '02', icon: Link2, title: 'Share One Link',
    color: '#818cf8', glow: 'rgba(129,140,248,0.28)',
    desc: 'Post on LinkedIn, job boards, or email blast. Candidates self-register through your branded portal.',
    detail: '247 applicants / 3 days',
  },
  {
    num: '03', icon: Filter, title: 'AI Screens CVs',
    color: '#a78bfa', glow: 'rgba(167,139,250,0.28)',
    desc: 'ATS + RAG pipeline scores every CV against your criteria in seconds. Weak matches automatically filtered out.',
    detail: '247 → 89 shortlisted',
  },
  {
    num: '04', icon: Calendar, title: 'Auto Scheduling',
    color: '#c084fc', glow: 'rgba(192,132,252,0.28)',
    desc: 'Shortlisted candidates self-select interview slots. No back-and-forth. Zero coordination overhead.',
    detail: '34 slots booked',
  },
  {
    num: '05', icon: Mic, title: 'AI Interview',
    color: '#e879f9', glow: 'rgba(232,121,249,0.28)',
    desc: 'Voice-based AI interview with adaptive follow-up questions. Real-time YOLOv8 integrity monitoring throughout.',
    detail: 'Avg 28 min session',
  },
  {
    num: '06', icon: BarChart3, title: 'Ranked Reports',
    color: '#34d399', glow: 'rgba(52,211,153,0.28)',
    desc: 'HR receives ranked shortlist with scores, transcripts, voice analysis, behavioral flags, and hire recommendations.',
    detail: 'Top 8 to inbox',
  },
];

/* ─── Animated line that draws itself on scroll ─────────── */
function DrawLine({
  direction = 'h',
  delay = 0,
  fromColor,
  toColor,
  reverse = false,
  className = '',
}: {
  direction?: 'h' | 'v';
  delay?: number;
  fromColor: string;
  toColor: string;
  reverse?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const isH = direction === 'h';
  const origin = reverse
    ? isH ? 'right center' : 'center bottom'
    : isH ? 'left center' : 'center top';

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden rounded-full ${className}`}
      style={{ background: 'rgba(255,255,255,0.04)' }}
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: isH
            ? `linear-gradient(${reverse ? '270deg' : '90deg'}, ${fromColor}, ${toColor})`
            : `linear-gradient(${reverse ? '0deg' : '180deg'}, ${fromColor}, ${toColor})`,
          transformOrigin: origin,
        }}
        initial={{ [isH ? 'scaleX' : 'scaleY']: 0 }}
        animate={inView ? { [isH ? 'scaleX' : 'scaleY']: 1 } : {}}
        transition={{ duration: 0.75, delay, ease: [0.4, 0, 0.2, 1] }}
      />
    </div>
  );
}

/* ─── Single step node + card ───────────────────────────── */
function StepCard({ step, delay }: { step: (typeof steps)[0]; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      className="flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.88 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Node */}
      <div className="relative mb-0 z-10">
        <motion.div
          className="absolute rounded-full"
          style={{ inset: -10, border: `1px solid ${step.color}22` }}
          animate={{ scale: [1, 1.45, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 3.2, repeat: Infinity, delay }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{ inset: -4, border: `1px solid ${step.color}45` }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0.1, 0.8] }}
          transition={{ duration: 2.6, repeat: Infinity, delay: delay + 0.5 }}
        />
        <div
          className="relative w-14 h-14 rounded-full flex items-center justify-center border-2 z-10"
          style={{
            background: `radial-gradient(circle at 35% 35%, ${step.color}28, rgba(4,4,12,0.95))`,
            borderColor: step.color + '60',
            boxShadow: `0 0 32px ${step.glow}, inset 0 1px 0 ${step.color}30`,
          }}
        >
          <step.icon className="w-6 h-6" style={{ color: step.color }} />
        </div>
        <div
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black z-20 border border-black/60"
          style={{ background: step.color, color: '#000' }}
        >
          {parseInt(step.num)}
        </div>
      </div>

      {/* Stem from node to card */}
      <DrawLine
        direction="v"
        delay={delay + 0.15}
        fromColor={step.color}
        toColor={step.color + '40'}
        className="w-[2px] h-5"
      />

      {/* Card */}
      <div
        className="w-full rounded-2xl border p-4 hover:scale-[1.025] transition-transform duration-200"
        style={{
          background: `linear-gradient(145deg, ${step.color}07, rgba(0,0,0,0.55))`,
          borderColor: step.color + '20',
          boxShadow: `0 4px 28px ${step.glow.replace('0.28', '0.07')}`,
        }}
      >
        <div
          className="text-[9px] font-mono tracking-[0.18em] mb-1.5 uppercase"
          style={{ color: step.color + 'aa' }}
        >
          Step {step.num}
        </div>
        <h3 className="text-white font-semibold text-sm mb-2 leading-snug">{step.title}</h3>
        <p className="text-white/40 text-[11px] leading-relaxed mb-3">{step.desc}</p>
        <div
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1.5 rounded-full"
          style={{
            background: step.color + '15',
            color: step.color,
            border: `1px solid ${step.color}30`,
          }}
        >
          <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
          {step.detail}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Section ───────────────────────────────────────────── */
export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const sectionInView = useInView(sectionRef, { once: false, margin: '-20%' });
  const [cycleKey, setCycleKey] = useState(0);

  // Last element finishes around 3.2s; keep full pipeline visible for 8s before replay.
  const DRAW_PHASE_MS = 20000;
  const FULLY_DRAWN_HOLD_MS = 8000;
  const CYCLE_INTERVAL_MS = DRAW_PHASE_MS + FULLY_DRAWN_HOLD_MS;

  useEffect(() => {
    if (!sectionInView) return;
    const id = setInterval(() => setCycleKey(k => k + 1), CYCLE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [sectionInView, CYCLE_INTERVAL_MS]);

  return (
    <section ref={sectionRef} id="how-it-works" className="relative py-28 px-6 bg-black overflow-hidden">
      {/* Background glow + dot grid */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full"
          style={{
            background:
              'radial-gradient(ellipse, rgba(47,151,247,0.07) 0%, rgba(167,139,250,0.05) 40%, transparent 70%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Heading */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          className="text-center mb-20"
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 mb-5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm font-medium"
            style={{
              boxShadow: '0 4px 20px rgba(47,151,247,0.2), inset 0 -1px 0 rgba(47,151,247,0.6)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" />
            The Pipeline
          </motion.div>

          <motion.h2
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.1 } },
            }}
            className="text-5xl md:text-6xl font-bold text-white mb-4"
          >
            From job posting to hire.{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, var(--color-brand), #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Automated.
            </span>
          </motion.h2>

          <motion.p
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } },
            }}
            className="text-lg text-white/50 max-w-xl mx-auto"
          >
            The complete hiring pipeline — no spreadsheets, no back-and-forth, no manual effort.
          </motion.p>
        </motion.div>

        {/* ══ PIPELINE — Desktop snake layout ══ */}
        <div key={cycleKey} className="hidden md:block">

          {/* ROW 1: Steps 1 → 2 → 3 (left to right) */}
          <div className="grid grid-cols-[1fr_72px_1fr_72px_1fr] items-start">
            <StepCard step={steps[0]} delay={0} />
            <div className="flex items-start pt-7">
              <DrawLine direction="h" delay={0.25} fromColor={steps[0].color} toColor={steps[1].color} className="w-full h-[2px]" />
            </div>
            <StepCard step={steps[1]} delay={0.4} />
            <div className="flex items-start pt-7">
              <DrawLine direction="h" delay={0.7} fromColor={steps[1].color} toColor={steps[2].color} className="w-full h-[2px]" />
            </div>
            <StepCard step={steps[2]} delay={0.85} />
          </div>

          {/* TURN: vertical connector on right (step 3 → step 4) */}
          <div className="grid grid-cols-[1fr_72px_1fr_72px_1fr]">
            <div /><div /><div /><div />
            <div className="flex justify-center">
              <DrawLine direction="v" delay={1.15} fromColor={steps[2].color} toColor={steps[3].color} className="w-[2px] h-14" />
            </div>
          </div>

          {/* ROW 2: Steps 6 ← 5 ← 4 (right to left; step 4 at right aligns with turn) */}
          <div className="grid grid-cols-[1fr_72px_1fr_72px_1fr] items-start">
            <StepCard step={steps[5]} delay={1.5} />
            <div className="flex items-start pt-7">
              <DrawLine direction="h" delay={1.75} fromColor={steps[4].color} toColor={steps[5].color} reverse className="w-full h-[2px]" />
            </div>
            <StepCard step={steps[4]} delay={2.0} />
            <div className="flex items-start pt-7">
              <DrawLine direction="h" delay={2.3} fromColor={steps[3].color} toColor={steps[4].color} reverse className="w-full h-[2px]" />
            </div>
            <StepCard step={steps[3]} delay={2.5} />
          </div>
        </div>

        {/* ══ PIPELINE — Mobile vertical ══ */}
        <div key={`m-${cycleKey}`} className="md:hidden flex flex-col items-center">
          {steps.map((step, i) => (
            <React.Fragment key={step.num}>
              <StepCard step={step} delay={i * 0.1} />
              {i < 5 && (
                <DrawLine
                  direction="v"
                  delay={i * 0.1 + 0.2}
                  fromColor={step.color}
                  toColor={steps[i + 1].color}
                  className="w-[2px] h-8"
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center text-xs text-white/45 mt-12 font-mono tracking-widest"
        >
          Full pipeline activates the moment a job is posted · Zero HR time after setup
        </motion.p>
      </div>
    </section>
  );
}

