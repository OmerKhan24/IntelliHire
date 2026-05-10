'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Award, Check } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

export function SocialProofSection() {
  return (
    <section id="about" className="relative py-28 px-6 bg-black overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[820px] h-[400px]"
          style={{ background: 'radial-gradient(ellipse 65% 55% at 50% 0%, rgba(37,99,235,0.13) 0%, transparent 70%)' }} />
        <div className="absolute top-1/3 -left-32 w-[400px] h-[400px]"
          style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)' }} />
        <div className="absolute top-1/3 -right-32 w-[400px] h-[400px]"
          style={{ background: 'radial-gradient(circle, rgba(47,151,247,0.05) 0%, transparent 70%)' }} />
      </div>
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="text-center mb-16"
        >
          {/* Vertical connector */}
          <motion.div variants={fadeUp} className="flex flex-col items-center mb-2">
            <div style={{ width: 1, height: 44, background: 'linear-gradient(to bottom, transparent, rgba(47,151,247,0.65))' }} />
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-brand)', boxShadow: '0 0 10px 3px rgba(47,151,247,0.5)', marginTop: 3 }} />
          </motion.div>

          {/* Badge row with flanking lines */}
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 mb-7">
            <div className="h-px flex-1 max-w-[80px]"
              style={{ background: 'linear-gradient(to right, transparent, rgba(47,151,247,0.6))' }} />
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm font-medium [box-shadow:0_4px_20px_rgba(47,151,247,0.2),inset_0_-1px_0_rgba(47,151,247,0.6)]">
              <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
              About the Project
            </div>
            <div className="h-px flex-1 max-w-[80px]"
              style={{ background: 'linear-gradient(to left, transparent, rgba(47,151,247,0.6))' }} />
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="text-6xl md:text-7xl font-bold leading-tight mb-5"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <span className="block text-white">Built with rigor.</span>
            <span className="text-gradient-blue-purple">Grounded in reality.</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-base text-white/45 max-w-xl mx-auto mb-8">
            IntelliHire started as a Final Year Project at FAST NUCES and is evolving into a product
            we are bringing to market.
          </motion.p>

          {/* Bottom divider */}
          <motion.div variants={fadeUp} className="mx-auto w-36 h-px"
            style={{ background: 'linear-gradient(to right, transparent, rgba(47,151,247,0.4), transparent)' }} />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid md:grid-cols-3 gap-6"
        >
          {/* University */}
          <motion.div
            variants={fadeUp}
            className="p-8 rounded-3xl border border-brand/20 bg-brand/5 text-center hover:shadow-lg hover:shadow-brand/10 transition-all overflow-hidden"
          >
            <div className="relative -mx-8 -mt-8 mb-6 h-32 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=180&auto=format&fit=crop&q=80"
                alt="FAST NUCES University"
                className="w-full h-full object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#070d1a]" />
            </div>
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-brand flex items-center justify-center shadow-lg glow-blue-icon">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div className="text-[11px] text-brand font-semibold uppercase tracking-[0.2em] mb-2">University</div>
            <h3 className="text-lg font-bold text-white mb-1 font-display">FAST NUCES</h3>
            <p className="text-sm text-white/50">
              National University of Computer and Emerging Sciences, Karachi Campus
            </p>
            <div className="mt-5 pt-4 border-t border-brand/15 text-xs text-white/35">
              CS Department · Batch 2022–2026
            </div>
          </motion.div>

          {/* Supervisor */}
          <motion.div
            variants={fadeUp}
            className="p-8 rounded-3xl border border-purple-500/20 bg-purple-500/5 text-center hover:shadow-lg hover:shadow-purple-500/10 transition-all overflow-hidden"
          >
            <div className="relative -mx-8 -mt-8 mb-6 h-32 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=180&auto=format&fit=crop&q=80"
                alt="Supervisor"
                className="w-full h-full object-cover opacity-35"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black" />
            </div>
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-900/50">
              <span className="text-xl font-bold text-white font-display">SI</span>
            </div>
            <div className="text-[11px] text-purple-400 font-semibold uppercase tracking-[0.2em] mb-2">Supervisor</div>
            <h3 className="text-lg font-bold text-white mb-1 font-display">Miss Sobia Iftikhar</h3>
            <p className="text-sm text-white/50">Faculty Member, CS Dept, FAST NUCES Karachi</p>
            <div className="mt-5 pt-4 border-t border-purple-500/15 text-xs text-white/35">
              CS Department · FYP Advisor 2025–2026
            </div>
          </motion.div>

          {/* Status */}
          <motion.div
            variants={fadeUp}
            className="p-8 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 text-center hover:shadow-lg hover:shadow-emerald-500/10 transition-all overflow-hidden"
          >
            <div className="relative -mx-8 -mt-8 mb-6 h-32 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=180&auto=format&fit=crop&q=80"
                alt="Project completed"
                className="w-full h-full object-cover opacity-35"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#070d1a]" />
            </div>
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-900/50">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div className="text-[11px] text-emerald-400 font-semibold uppercase tracking-[0.2em] mb-2">Status</div>
            <h3 className="text-lg font-bold text-white mb-1 font-display">FYP Completed</h3>
            <p className="text-sm text-white/50 mb-5">Successfully evaluated and graded</p>
            <div className="space-y-2.5">
              {[
                { text: 'Proposal Approved', done: true },
                { text: 'Mid-Term Evaluation ✓', done: true },
                { text: 'Final Defence ✓', done: true },
                { text: 'Now: Building the Product', done: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-center gap-2">
                  <Check className={`w-3.5 h-3.5 flex-shrink-0 ${item.done ? 'text-emerald-400' : 'text-amber-400'}`} />
                  <span className={`text-xs ${item.done ? 'text-white/55' : 'text-amber-400 font-medium'}`}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
