'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Bell, Calendar, Zap, Users, Clock } from 'lucide-react';

// Target launch date — May 5, 2026
const LAUNCH_DATE = new Date('2026-05-05T00:00:00Z');

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(): TimeLeft {
  const now = new Date();
  const diff = Math.max(LAUNCH_DATE.getTime() - now.getTime(), 0);
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

/* ── Animated countdown tile ── */
function CountdownTile({ value, label, color }: { value: number; label: string; color: string }) {
  const [prev, setPrev] = useState(value);
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    if (value !== prev) {
      setFlip(true);
      const t = setTimeout(() => { setPrev(value); setFlip(false); }, 300);
      return () => clearTimeout(t);
    }
  }, [value, prev]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        {/* Glow ring */}
        <div
          className="absolute inset-[-6px] rounded-[22px] opacity-40 blur-md"
          style={{ background: color }}
        />
        {/* Tile */}
        <div
          className="relative w-[68px] h-[68px] sm:w-[88px] sm:h-[88px] md:w-[108px] md:h-[108px] rounded-2xl flex items-center justify-center overflow-hidden border"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(0,0,0,0.7) 100%)',
            borderColor: `${color}40`,
            boxShadow: `0 0 30px ${color}25, inset 0 1px 0 ${color}30`,
          }}
        >
          {/* Top half reflection */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/[0.03] rounded-t-2xl" />
          {/* Center divider */}
          <div className="absolute top-1/2 left-0 right-0 h-px" style={{ background: `${color}20` }} />

          <motion.span
            key={value}
            className="text-3xl sm:text-4xl md:text-5xl font-black text-white tabular-nums tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
            initial={{ y: flip ? -20 : 0, opacity: flip ? 0 : 1 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {String(value).padStart(2, '0')}
          </motion.span>
        </div>
        {/* Bottom edge light */}
        <div className="absolute -bottom-px left-4 right-4 h-px rounded-full" style={{ background: `${color}80` }} />
      </div>
      <span className="text-[9px] font-black uppercase tracking-[0.25em]" style={{ color: `${color}cc` }}>{label}</span>
    </div>
  );
}

/* ── Orbiting dot ring ── */
function OrbitRing({ radius, count, color, duration }: { radius: number; count: number; color: string; duration: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ borderRadius: '50%' }}>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (360 / count) * i;
        return (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: color,
              top: '50%',
              left: '50%',
              x: -2,
              y: -2,
            }}
            animate={{
              rotate: [angle, angle + 360],
              x: [
                Math.cos((angle * Math.PI) / 180) * radius - 2,
                Math.cos(((angle + 360) * Math.PI) / 180) * radius - 2,
              ],
              y: [
                Math.sin((angle * Math.PI) / 180) * radius - 2,
                Math.sin(((angle + 360) * Math.PI) / 180) * radius - 2,
              ],
            }}
            transition={{ duration, repeat: Infinity, ease: 'linear', delay: 0 }}
          />
        );
      })}
    </div>
  );
}

export function LaunchingSoon() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft());
  const [notified, setNotified] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const tiles = [
    { value: timeLeft.days, label: 'Days', color: 'var(--color-brand)' },
    { value: timeLeft.hours, label: 'Hours', color: '#818cf8' },
    { value: timeLeft.minutes, label: 'Minutes', color: '#a78bfa' },
    { value: timeLeft.seconds, label: 'Seconds', color: '#e879f9' },
  ];

  return (
    <section className="relative py-32 px-6 overflow-hidden bg-black">

      {/* ── Background ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Main radial burst */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(47,151,247,0.12) 0%, rgba(167,139,250,0.07) 40%, transparent 70%)', filter: 'blur(60px)' }} />
        {/* Pink accent glow */}
        <motion.div
          className="absolute top-[-10%] right-[10%] w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(232,121,249,0.1) 0%, transparent 65%)', filter: 'blur(80px)' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Blue accent glow */}
        <motion.div
          className="absolute bottom-[-10%] left-[5%] w-[500px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(47,151,247,0.1) 0%, transparent 65%)', filter: 'blur(80px)' }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        {/* Top + bottom lines */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-[#a78bfa]/30 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">

        {/* ── Badge ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <div className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-brand/30 bg-brand/10 text-brand text-xs font-bold tracking-[0.15em] uppercase">
            <motion.span animate={{ rotate: [0, 15, -10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
              <Rocket className="w-3.5 h-3.5" />
            </motion.span>
            Early Access Opening Soon
            <motion.span
              className="absolute -right-1 -top-1 w-2.5 h-2.5 rounded-full bg-brand"
              animate={{ scale: [1, 1.6, 1], opacity: [1, 0, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>

        {/* ── Headline ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-5"
        >
          <h2 className="font-black text-white leading-[0.95] tracking-tight mb-4"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3.5rem, 9vw, 7rem)' }}>
            Launching
          </h2>
          <h2 className="font-black leading-[0.95] tracking-tight"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(3.5rem, 9vw, 7rem)',
              background: 'linear-gradient(90deg, var(--color-brand) 0%, #a78bfa 50%, #e879f9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
            Soon
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center text-slate-500 text-base max-w-md mx-auto mb-14 leading-relaxed"
        >
          The first fully automated AI hiring pipeline. Reserve your early access slot now.
        </motion.p>

        {/* ── Countdown ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="flex items-start justify-center gap-1.5 sm:gap-3 md:gap-5 mb-16"
        >
          {tiles.map((t, i) => (
            <React.Fragment key={t.label}>
              <CountdownTile value={t.value} label={t.label} color={t.color} />
              {i < 3 && (
                <div className="flex flex-col items-center pt-8 gap-2">
                  <motion.div className="w-1 h-1 rounded-full bg-white/30"
                    animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} />
                  <motion.div className="w-1 h-1 rounded-full bg-white/30"
                    animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.5 }} />
                </div>
              )}
            </React.Fragment>
          ))}
        </motion.div>

        {/* ── Stats strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35 }}
          className="flex justify-center gap-8 mb-12"
        >
          {[
            { icon: Users, label: '37 / 50 slots', sub: 'claimed', color: 'var(--color-brand)' },
            { icon: Zap, label: 'Beta launch', sub: 'May 2026', color: '#a78bfa' },
            { icon: Clock, label: 'Founding members', sub: '6 months free', color: '#34d399' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center border"
                style={{ background: `${s.color}15`, borderColor: `${s.color}30` }}>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <div>
                <div className="text-xs font-bold text-white leading-none mb-0.5">{s.label}</div>
                <div className="text-[10px] text-slate-500">{s.sub}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Slot progress bar ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="max-w-lg mx-auto mb-10"
        >
          <div className="flex justify-between items-center text-[11px] mb-2.5">
            <span className="text-slate-500 font-medium">Early access slots filling up</span>
            <span className="font-bold" style={{ color: 'var(--color-brand)' }}>37 / 50 claimed</span>
          </div>
          <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: '74%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full relative"
              style={{ background: 'linear-gradient(90deg, var(--color-brand), #a78bfa, #e879f9)' }}
            >
              {/* Shimmer on bar */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
              />
            </motion.div>
          </div>
          <div className="flex justify-between items-center mt-2">
            <div className="flex gap-1">
              {Array.from({ length: 50 }).map((_, i) => (
                <div key={i} className="w-0.5 h-2 rounded-full" style={{ background: i < 37 ? 'var(--color-brand)' : 'rgba(255,255,255,0.06)' }} />
              ))}
            </div>
          </div>
          <p className="text-[10px] text-slate-600 mt-1.5 text-right">Only 13 slots remaining</p>
        </motion.div>

        {/* ── CTAs ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.45 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          {notified ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-sm"
            >
              ✓ You&apos;re on the list — we&apos;ll reach out!
            </motion.div>
          ) : (
            <button
              onClick={() => setNotified(true)}
              className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-bold text-sm overflow-hidden btn-primary"
            >
              <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <Bell className="w-4 h-4" />
              </motion.span>
              Get Early Access
              <motion.div
                className="absolute inset-0 rounded-2xl"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              />
            </button>
          )}
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border border-white/[0.1] bg-white/[0.04] text-white/60 font-semibold text-sm hover:bg-white/[0.08] hover:text-white hover:border-white/20 transition-all duration-200"
          >
            <Calendar className="w-4 h-4" />
            Add to Calendar
          </a>
        </motion.div>
      </div>
    </section>
  );
}
