'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FileText, Mic, ShieldCheck, ArrowUpRight, ArrowRight, Brain, Check } from 'lucide-react';
import type { Variants } from 'framer-motion';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } as never },
};
const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// Rays fanned evenly from top-center — gentle ±4° breathe
const beams = [
  { restAngle: -55, swingDeg: 4, duration: 14, delay: 0,   opacity: 0.28, width: 70  },
  { restAngle: -42, swingDeg: 4, duration: 16, delay: 1.0, opacity: 0.32, width: 80  },
  { restAngle: -28, swingDeg: 4, duration: 13, delay: 2.2, opacity: 0.36, width: 90  },
  { restAngle: -14, swingDeg: 4, duration: 15, delay: 0.5, opacity: 0.40, width: 85  },
  { restAngle:   0, swingDeg: 4, duration: 17, delay: 3.0, opacity: 0.42, width: 95  },
  { restAngle:  14, swingDeg: 4, duration: 15, delay: 1.8, opacity: 0.40, width: 85  },
  { restAngle:  28, swingDeg: 4, duration: 13, delay: 0.8, opacity: 0.36, width: 90  },
  { restAngle:  42, swingDeg: 4, duration: 16, delay: 2.5, opacity: 0.32, width: 80  },
  { restAngle:  55, swingDeg: 4, duration: 14, delay: 1.5, opacity: 0.28, width: 70  },
];

const cards = [
  { icon: FileText,    title: 'AI Interview Report',     sub: 'Comprehensive Analysis' },
  { icon: Mic,         title: 'Voice & Speech Analysis', sub: 'Confidence & Clarity Score' },
  { icon: ShieldCheck, title: 'Proctoring Summary',      sub: 'Trust & Integrity Check' },
];

export function MockReportTeaser() {
  return (
    <section id="demo" className="relative py-20 px-6 bg-black overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% 0%, #060e22 0%, #02060f 50%, #010308 100%)',
            border: '1px solid rgba(37,99,235,0.22)',
            boxShadow: '0 0 0 1px rgba(37,99,235,0.08), 0 32px 80px rgba(0,0,0,0.7)',
          }}
        >
          {/* Dot grid */}
          <div
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(rgba(37,99,235,0.18) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />

          {/* Spotlight rays — all from top-center, gentle breathe */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 z-0 pointer-events-none"
            style={{ width: '100%', height: '90%', overflow: 'hidden' }}
          >
            {beams.map((b, i) => (
              <motion.div
                key={i}
                className="absolute top-0 left-1/2"
                style={{
                  width: b.width,
                  height: '100%',
                  marginLeft: -b.width / 2,
                  transformOrigin: 'top center',
                  background: `linear-gradient(to bottom, rgba(120,170,255,${b.opacity}) 0%, rgba(60,120,255,${b.opacity * 0.6}) 30%, rgba(37,99,235,${b.opacity * 0.25}) 60%, transparent 85%)`,
                  filter: 'blur(7px)',
                  mixBlendMode: 'screen' as const,
                  rotate: `${b.restAngle}deg`,
                }}
                animate={{
                  rotate: [
                    `${b.restAngle - b.swingDeg}deg`,
                    `${b.restAngle + b.swingDeg}deg`,
                    `${b.restAngle - b.swingDeg}deg`,
                  ],
                  opacity: [b.opacity * 0.7, b.opacity, b.opacity * 0.7],
                }}
                transition={{
                  duration: b.duration,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: b.delay,
                }}
              />
            ))}
            {/* Central bloom at source */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse 60% 70% at 50% 0%, rgba(60,110,220,0.35) 0%, rgba(37,99,235,0.15) 40%, rgba(20,50,150,0.05) 70%, transparent 100%)',
                filter: 'blur(18px)',
              }}
            />
            {/* Tight bright hotspot */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[100px] pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 0%, rgba(140,180,255,0.4) 0%, transparent 70%)',
                filter: 'blur(8px)',
              }}
            />
          </div>

          {/* Header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="relative z-10 flex flex-col items-center text-center px-8 pt-16 pb-10"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-5 py-2.5 mb-5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm font-medium [box-shadow:0_4px_20px_rgba(47,151,247,0.2),inset_0_-1px_0_rgba(47,151,247,0.6)]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
              Sample Output
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="text-6xl md:text-7xl font-bold leading-tight mb-5"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <span className="block text-white">What You Get After</span>
              <span className="text-gradient-blue-purple">Every AI Interview.</span>
            </motion.h2>

            <motion.p variants={fadeUp} className="text-base text-white/45 max-w-md mx-auto mb-8">
              A comprehensive AI-generated report with scores, voice analysis, and proctoring — delivered automatically within minutes.
            </motion.p>

            <motion.div variants={fadeUp}>
              <Link
                href="/report"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: '#2563eb' }}
              >
                View Sample Report
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Report mockup */}
          <motion.div
            initial={{ opacity: 0, y: 48 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 px-8 pb-10"
          >
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50">
              {/* Browser chrome */}
              <div className="bg-[#111] border-b border-white/[0.08] px-5 py-3 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 bg-white/5 rounded-md px-3 py-1.5 text-xs text-white/40 font-mono border border-white/[0.08]">
                  intellihire.app/reports/IH-2024-0847
                </div>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full whitespace-nowrap">
                  Live Preview
                </span>
              </div>

              <div className="bg-[#111] p-6 md:p-8 space-y-6">
                {/* Candidate header */}
                <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-white/[0.08]">
                  <div>
                    <div className="text-[11px] text-white/35 mb-1 font-mono">
                      Interview Assessment Report · #IH-2024-0847 · Apr 5, 2026
                    </div>
                    <h3 className="text-xl font-bold text-white">Ahmed Khan</h3>
                    <p className="text-sm text-white/50 mt-0.5">Senior Frontend Engineer · TechCorp Solutions</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold text-emerald-400 tracking-wide">STRONGLY RECOMMENDED</span>
                    </div>
                    <div className="text-4xl font-bold text-white">
                      87<span className="text-xl text-white/35">/100</span>
                    </div>
                    <div className="text-[11px] text-white/35 mt-0.5">Overall Score</div>
                  </div>
                </div>

                {/* Score bars */}
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { label: 'Technical Competency', score: 86, color: 'bg-indigo-500' },
                    { label: 'Communication Skills', score: 93, color: 'bg-emerald-500' },
                    { label: 'Problem Solving',      score: 79, color: 'bg-blue-500'  },
                    { label: 'Professionalism',      score: 95, color: 'bg-blue-500'    },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-medium text-white/55">{item.label}</span>
                        <span className="text-xs font-bold text-white">{item.score}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Proctoring log + voice analysis */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 rounded-2xl bg-white/5 border border-white/[0.08] p-4">
                    <div className="text-[11px] text-white/40 uppercase tracking-wider font-semibold mb-3">Proctoring Log</div>
                    {[
                      { label: 'Gaze Anomalies',   status: 'None Detected',  ok: true  },
                      { label: 'Device Violations', status: 'Clean Session',  ok: true  },
                      { label: 'Multiple Faces',    status: 'Not Detected',   ok: true  },
                      { label: 'Tab Switching',     status: '1 Minor Event',  ok: false },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-white/[0.08] last:border-0">
                        <span className="text-xs text-white/55">{item.label}</span>
                        <span className={`text-xs font-semibold ${item.ok ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-2xl bg-white/5 border border-white/[0.08] p-4 flex flex-col justify-center gap-4">
                    <div className="text-[11px] text-white/40 uppercase tracking-wider font-semibold">Voice Analysis</div>
                    {[
                      { label: 'Clarity',     val: '89%',     color: 'text-brand'  },
                      { label: 'Confidence',  val: '92%',     color: 'text-emerald-400' },
                      { label: 'Pace',        val: 'Optimal', color: 'text-brand'  },
                    ].map((v) => (
                      <div key={v.label} className="flex justify-between items-center">
                        <span className="text-xs text-white/45">{v.label}</span>
                        <span className={`text-sm font-bold ${v.color}`}>{v.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Summary */}
                <div className="rounded-2xl bg-brand/[0.08] border border-brand/20 p-5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-brand mb-3">
                    <Brain className="w-3.5 h-3.5" />
                    AI Assessment Summary
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed">
                    &quot;Ahmed demonstrated strong foundational knowledge in React and TypeScript with well-structured,
                    confident responses. Communication was articulate and consistently professional.{' '}
                    <strong className="font-semibold text-white">Recommend proceeding to technical round.</strong>&quot;
                  </p>
                </div>
              </div>
            </div>
            {/* Bottom fade */}
            <div className="absolute bottom-10 left-8 right-8 h-16 bg-gradient-to-t from-[#000] to-transparent pointer-events-none rounded-b-2xl" />
          </motion.div>

          {/* Feature cards */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={stagger}
            className="relative z-10 grid grid-cols-1 md:grid-cols-3"
            style={{ borderTop: '1px solid rgba(37,99,235,0.18)' }}
          >
            {cards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="group relative flex flex-col gap-6 p-8 cursor-pointer transition-all duration-300 hover:bg-white/[0.03]"
                  style={{ borderRight: i < 2 ? '1px solid rgba(37,99,235,0.18)' : 'none' }}
                >
                  <ArrowUpRight className="absolute top-6 right-6 w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      background: 'rgba(37,99,235,0.35)',
                      border: '1px solid rgba(47,151,247,0.35)',
                    }}
                  >
                    <Icon className="w-5 h-5 text-blue-300" />
                  </div>
                  <div>
                    <div className="text-base font-bold text-white mb-1">{card.title}</div>
                    <div className="text-sm text-white/40">{card.sub}</div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

