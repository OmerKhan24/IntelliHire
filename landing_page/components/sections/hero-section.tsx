'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { GraduationCap, ArrowRight, FileText } from 'lucide-react';

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      className="relative bg-black overflow-hidden min-h-screen flex flex-col justify-center"
    >
      {/* ── Moving gradient layer ─────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">

        {/* Primary blob — starts top-left, drifts to bottom-right */}
        <motion.div
          className="absolute"
          style={{
            width: 900,
            height: 780,
            background:
              'radial-gradient(ellipse at 50% 50%, rgba(47,151,247,0.38) 0%, rgba(99,102,241,0.22) 35%, rgba(167,139,250,0.10) 58%, transparent 75%)',
            filter: 'blur(90px)',
            top: '-20%',
            left: '-15%',
          }}
          animate={{
            x: [0, 420, 600, 260, 0],
            y: [0, 180, 420, 560, 0],
            borderRadius: [
              '62% 38% 54% 46% / 44% 56% 44% 56%',
              '38% 62% 46% 54% / 56% 44% 56% 44%',
              '54% 46% 38% 62% / 44% 56% 62% 38%',
              '46% 54% 62% 38% / 56% 44% 38% 62%',
              '62% 38% 54% 46% / 44% 56% 44% 56%',
            ],
          }}
          transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Secondary blob — starts bottom-right, sweeps to top-left */}
        <motion.div
          className="absolute"
          style={{
            width: 800,
            height: 700,
            background:
              'radial-gradient(ellipse at 50% 50%, rgba(139,92,246,0.35) 0%, rgba(99,102,241,0.20) 40%, rgba(47,151,247,0.08) 62%, transparent 78%)',
            filter: 'blur(100px)',
            bottom: '-20%',
            right: '-15%',
          }}
          animate={{
            x: [0, -380, -520, -200, 0],
            y: [0, -200, -380, -480, 0],
            borderRadius: [
              '46% 54% 68% 32% / 52% 48% 52% 48%',
              '68% 32% 46% 54% / 48% 52% 48% 52%',
              '32% 68% 54% 46% / 62% 38% 54% 46%',
              '54% 46% 32% 68% / 38% 62% 46% 54%',
              '46% 54% 68% 32% / 52% 48% 52% 48%',
            ],
          }}
          transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        />

        {/* Accent blob — mid-screen, slow diagonal drift */}
        <motion.div
          className="absolute"
          style={{
            width: 560,
            height: 480,
            background:
              'radial-gradient(ellipse at 50% 50%, rgba(96,165,250,0.28) 0%, rgba(167,139,250,0.16) 45%, transparent 72%)',
            filter: 'blur(80px)',
            top: '30%',
            left: '30%',
          }}
          animate={{
            x: [0, 280, 100, -200, 0],
            y: [0, -150, 200, 80, 0],
            borderRadius: [
              '72% 28% 42% 58% / 38% 62% 38% 62%',
              '42% 58% 72% 28% / 62% 38% 62% 38%',
              '28% 72% 58% 42% / 48% 52% 38% 62%',
              '58% 42% 28% 72% / 62% 38% 52% 48%',
              '72% 28% 42% 58% / 38% 62% 38% 62%',
            ],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 8 }}
        />
      </div>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center text-center pt-32 pb-20 px-6 max-w-5xl mx-auto w-full">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-10 rounded-full bg-brand/10 border border-brand/30 text-brand text-sm font-medium"
        >
          <GraduationCap className="w-3.5 h-3.5 shrink-0" />
          FAST NUCES Karachi &middot; FYP 2025-26
          <span className="inline-flex items-center gap-1 ml-1 px-2 py-0.5 rounded-full bg-brand/15 border border-brand/30 text-[10px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            In Development
          </span>
        </motion.div>

        {/* H1 */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="font-bold leading-[1.04] tracking-tight text-white mb-3"
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 7vw, 5.5rem)' }}
        >
          Filter the Noise
        </motion.h1>
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="font-bold leading-[1.04] tracking-tight mb-8"
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 7vw, 5.5rem)' }}
        >
          <span className="text-gradient-blue-purple">Find the Talent.</span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.24 }}
          className="text-lg text-slate-400 max-w-2xl mb-12 leading-relaxed"
        >
          An end-to-end AI hiring platform that handles{' '}
          <span className="text-white font-semibold">
            CV screening, AI scoring, voice interviews, proctoring,
          </span>{' '}
          and ranked reports — automatically. No HR hours on initial screening.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <a
            href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/register`}
            className="group inline-flex items-center gap-2 px-9 py-4 text-white font-semibold rounded-xl text-sm btn-primary"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
          <Link
            href="/report"
            className="inline-flex items-center gap-2 px-9 py-4 bg-white/[0.07] border border-white/15 hover:bg-white/11 text-white font-semibold rounded-xl transition-all duration-200 text-sm"
          >
            <FileText className="w-4 h-4 text-brand" />
            View Sample Report
          </Link>
        </motion.div>
      </div>

      {/* ── Stats row ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 flex items-center justify-center gap-10 pb-14 px-6"
      >
        <div className="flex items-center justify-center gap-10 w-full max-w-xl pt-6 border-t border-slate-800/70">
          {[
            { value: '~85%', label: 'Less Screening Work' },
            { value: 'FYP 2025-26', label: 'Active Development' },
            { value: '0 hrs', label: 'Manual Work (Goal)' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div
                className="text-2xl font-bold text-white mb-0.5"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {s.value}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

