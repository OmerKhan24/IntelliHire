'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimationFrame } from 'framer-motion';
import { Play, Eye, Mic, Brain, Shield, Zap } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

// Animated scanning line inside the video
function ScanLine() {
  const [y, setY] = useState(0);
  const dir = useRef(1);
  useAnimationFrame((_, delta) => {
    setY(prev => {
      const next = prev + dir.current * (delta * 0.03);
      if (next >= 100) dir.current = -1;
      if (next <= 0) dir.current = 1;
      return Math.max(0, Math.min(100, next));
    });
  });
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ borderRadius: 'inherit' }}>
      <div
        className="absolute left-0 right-0 h-px"
        style={{
          top: `${y}%`,
          background: 'linear-gradient(to right, transparent 5%, rgba(47,151,247,0.6) 35%, rgba(47,151,247,0.9) 50%, rgba(47,151,247,0.6) 65%, transparent 95%)',
          boxShadow: '0 0 12px 2px rgba(47,151,247,0.35)',
        }}
      />
    </div>
  );
}

// Small pulsing badge
function PingBadge({ color }: { color: string }) {
  return (
    <span className="relative flex h-2 w-2">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`} />
      <span className={`relative inline-flex rounded-full h-2 w-2 ${color}`} />
    </span>
  );
}

export function VideoDemoSection() {
  return (
    <section className="relative py-24 px-6 bg-black overflow-hidden" id="demo">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px]"
          style={{ background: 'radial-gradient(ellipse 70% 55% at 50% 0%, rgba(37,99,235,0.16) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px]"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(99,102,241,0.1) 0%, transparent 70%)' }} />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">

        {/* ── Heading ── */}
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}
          className="text-center mb-14"
        >
          {/* Connector */}
          <motion.div variants={fadeUp} className="flex flex-col items-center mb-3">
            <div style={{ width: 1, height: 44, background: 'linear-gradient(to bottom, transparent, rgba(47,151,247,0.65))' }} />
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-brand)', boxShadow: '0 0 12px 3px rgba(47,151,247,0.5)', marginTop: 3 }} />
          </motion.div>

          <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 mb-7">
            <div className="h-px flex-1 max-w-[72px]" style={{ background: 'linear-gradient(to right, transparent, rgba(47,151,247,0.55))' }} />
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white text-sm font-medium"
              style={{ boxShadow: '0 4px 20px rgba(47,151,247,0.18), inset 0 -1px 0 rgba(47,151,247,0.5)' }}>
              <PingBadge color="bg-brand" />
              Product Demo
            </div>
            <div className="h-px flex-1 max-w-[72px]" style={{ background: 'linear-gradient(to left, transparent, rgba(47,151,247,0.55))' }} />
          </motion.div>

          <motion.h2 variants={fadeUp} className="text-5xl md:text-6xl font-bold text-white mb-4 font-display leading-tight">
            IntelliHire{' '}
            <span style={{ background: 'linear-gradient(90deg, var(--color-brand) 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              in action
            </span>
            <span className="text-white"> !</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-white/45 text-[17px] max-w-xl mx-auto leading-relaxed">
            A complete walkthrough — from job link to ranked candidate reports.
          </motion.p>
        </motion.div>

        {/* ── Floating feature pills above video ── */}
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
          className="flex flex-wrap justify-center gap-3 mb-8"
        >
          {[
            { icon: Eye, label: 'YOLOv8 Proctoring', color: 'text-emerald-400' },
            { icon: Mic, label: 'Voice Analysis', color: 'text-blue-400' },
            { icon: Brain, label: 'GPT-4o Scoring', color: 'text-purple-400' },
            { icon: Shield, label: 'Integrity Engine', color: 'text-cyan-400' },
            { icon: Zap, label: 'Real-time Reports', color: 'text-amber-400' },
          ].map(({ icon: Icon, label, color }) => (
            <motion.div
              key={label}
              variants={fadeUp}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-medium text-white/60 hover:text-white hover:bg-white/[0.07] transition-all duration-200"
            >
              <Icon className={`w-3.5 h-3.5 ${color} flex-shrink-0`} />
              {label}
            </motion.div>
          ))}
        </motion.div>

        {/* ── Video frame ── */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          {/* Outer glow halo */}
          <div className="absolute -inset-px rounded-3xl pointer-events-none"
            style={{ background: 'linear-gradient(135deg, rgba(47,151,247,0.35) 0%, rgba(99,102,241,0.25) 50%, rgba(167,139,250,0.2) 100%)', padding: 1 }}>
            <div className="absolute inset-0 rounded-3xl" style={{ background: 'transparent' }} />
          </div>
          <div className="absolute -inset-4 rounded-[2rem] blur-2xl opacity-30 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse, rgba(47,151,247,0.5) 0%, rgba(99,102,241,0.3) 50%, transparent 70%)' }} />

          <div
            className="relative rounded-3xl overflow-hidden border border-white/10 cursor-pointer group"
            style={{ aspectRatio: '16/9' }}
          >
            {/* Background image */}
            <img
              src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&h=675&auto=format&fit=crop&q=80"
              alt="Interview session"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(135deg, rgba(13,17,50,0.88) 0%, rgba(15,10,45,0.82) 50%, rgba(10,20,40,0.88) 100%)' }} />

            {/* Scanning line */}
            <ScanLine />

            {/* Corner scan brackets */}
            {[['top-4 left-4', 'border-t-2 border-l-2 rounded-tl-lg'],
              ['top-4 right-4', 'border-t-2 border-r-2 rounded-tr-lg'],
              ['bottom-4 left-4', 'border-b-2 border-l-2 rounded-bl-lg'],
              ['bottom-4 right-4', 'border-b-2 border-r-2 rounded-br-lg'],
            ].map(([pos, cls], i) => (
              <motion.div
                key={i}
                className={`absolute ${pos} w-6 h-6 border-brand/60 ${cls}`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.1, duration: 0.4 }}
              />
            ))}

            {/* TOP-LEFT: Recording badge */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-5 left-5 bg-black/50 border border-white/15 rounded-xl p-3 backdrop-blur-md text-xs"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-white font-mono font-semibold">Recording</span>
              </div>
              <span className="text-white/55 font-mono">00:04:32</span>
            </motion.div>

            {/* TOP-RIGHT: Gaze Status */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-5 right-5 bg-black/50 border border-white/15 rounded-xl p-3 backdrop-blur-md text-xs"
            >
              <div className="text-white/50 mb-1">Gaze Status</div>
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <PingBadge color="bg-emerald-400" />
                Focused
              </div>
            </motion.div>

            {/* RIGHT-CENTER: Live score pulse */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1, duration: 0.5 }}
              className="absolute top-1/2 -translate-y-1/2 right-5 bg-black/50 border border-indigo-500/30 rounded-xl p-3 backdrop-blur-md text-xs"
            >
              <div className="text-white/45 text-[10px] mb-1.5">Live Score</div>
              <div className="text-2xl font-bold text-indigo-400" style={{ fontFamily: 'monospace' }}>87</div>
              <div className="text-[10px] text-emerald-400 mt-0.5">↑ Top 15%</div>
            </motion.div>

            {/* BOTTOM-LEFT: AI Question */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-5 left-5 bg-black/50 border border-white/15 rounded-xl p-3 backdrop-blur-md text-xs max-w-[52%]"
            >
              <div className="flex items-center gap-1.5 text-brand mb-1.5 text-[10px] font-semibold">
                <Brain className="w-3 h-3" /> AI Question
              </div>
              <div className="text-white/80 text-[11px] leading-relaxed">
                &ldquo;Explain how you&apos;d architect a real-time data pipeline at scale...&rdquo;
              </div>
            </motion.div>

            {/* BOTTOM-RIGHT: Mini waveform */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="absolute bottom-5 right-5 bg-black/50 border border-white/15 rounded-xl px-3 py-2.5 backdrop-blur-md"
            >
              <div className="text-[10px] text-white/40 mb-1.5">Voice</div>
              <div className="flex items-end gap-[3px] h-6">
                {[8,14,6,18,10,22,12,16,8,20,14,10,18,12,24,10,16].map((h, i) => (
                  <motion.div
                    key={i}
                    className="w-[3px] rounded-full bg-brand"
                    style={{ height: h }}
                    animate={{ height: [h, h * 0.4, h] }}
                    transition={{ repeat: Infinity, duration: 0.8 + i * 0.06, ease: 'easeInOut', delay: i * 0.04 }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Center play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.08 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {/* Ping rings */}
                <motion.div
                  className="absolute inset-0 rounded-full border border-white/20"
                  animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border border-white/15"
                  animate={{ scale: [1, 2.1], opacity: [0.3, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeOut', delay: 0.4 }}
                />
                <div className="relative w-20 h-20 rounded-full bg-white/15 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:bg-white/25 transition-all duration-300"
                  style={{ boxShadow: '0 0 40px 10px rgba(47,151,247,0.25)' }}>
                  <Play className="w-8 h-8 text-white fill-white ml-1" />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* ── Bottom tag line ── */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center text-xs text-white/50 mt-5 font-mono tracking-widest"
        >
          Demo video coming soon · Product under active development
        </motion.p>
      </div>
    </section>
  );
}
