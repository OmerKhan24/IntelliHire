'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Building2, Rocket } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

const plans = [
  {
    name: 'Starter',
    icon: Rocket,
    iconColor: 'text-brand',
    badge: 'Most Pick',
    price: 'Coming Soon',
    period: 'Free early access',
    desc: 'Perfect for small teams and startup recruiters getting started with AI hiring.',
    stats: ['50 Interviews/mo', 'Basic Reports'],
    features: [
      { text: 'Up to 50 interviews / month', active: true },
      { text: 'AI question generation', active: true },
      { text: 'Basic scoring & reports', active: true },
      { text: 'Candidate portal', active: false },
      { text: 'Standard proctoring', active: false },
      { text: 'Email support', active: false },
    ],
    cta: 'Join Waitlist',
  },
  {
    name: 'Growth',
    icon: Zap,
    iconColor: 'text-violet-400',
    badge: 'Recommended',
    price: 'Coming Soon',
    period: 'Exclusive early rate',
    desc: 'For scaling HR teams that need the full AI stack with unlimited capacity.',
    stats: ['Unlimited Interviews', 'Full AI Stack'],
    features: [
      { text: 'Unlimited interviews', active: true },
      { text: 'YOLOv8 advanced proctoring', active: true },
      { text: 'Full AI reports with analysis', active: true },
      { text: 'Custom question banks', active: true },
      { text: 'Priority support', active: true },
      { text: 'Analytics dashboard', active: true },
      { text: 'Multi-language support (EN/UR)', active: false },
    ],
    cta: 'Get Early Access',
  },
  {
    name: 'Enterprise',
    icon: Building2,
    iconColor: 'text-emerald-400',
    badge: null,
    price: 'Contact Us',
    period: 'Custom quote',
    desc: 'Custom deployment for large organisations, agencies, and institutions.',
    stats: ['Custom Scale', 'Full API Access'],
    features: [
      { text: 'Custom AI model fine-tuning', active: true },
      { text: 'On-premise or private cloud', active: true },
      { text: 'SSO & enterprise security', active: true },
      { text: 'Full API access', active: true },
      { text: 'Dedicated account manager', active: true },
      { text: 'SLA guarantee', active: true },
      { text: 'GDPR compliance package', active: true },
    ],
    cta: 'Contact Sales',
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="relative py-28 px-6 bg-black overflow-hidden">
      {/* Heading area decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft radial glow behind heading */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[340px]"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(37,99,235,0.13) 0%, transparent 75%)' }} />
        {/* Horizontal rule left */}
        <div className="absolute top-[178px] left-0 w-[calc(50%-320px)] h-px"
          style={{ background: 'linear-gradient(to right, transparent 0%, rgba(47,151,247,0.5) 60%, rgba(47,151,247,0.8) 100%)' }} />
        {/* Horizontal rule right */}
        <div className="absolute top-[178px] right-0 w-[calc(50%-320px)] h-px"
          style={{ background: 'linear-gradient(to left, transparent 0%, rgba(47,151,247,0.5) 60%, rgba(47,151,247,0.8) 100%)' }} />
        {/* Dot left */}
        <div className="absolute top-[174px] left-[calc(50%-322px)] w-2 h-2 rounded-full"
          style={{ background: 'rgba(47,151,247,0.9)', boxShadow: '0 0 8px 2px rgba(47,151,247,0.6)' }} />
        {/* Dot right */}
        <div className="absolute top-[174px] right-[calc(50%-322px)] w-2 h-2 rounded-full"
          style={{ background: 'rgba(47,151,247,0.9)', boxShadow: '0 0 8px 2px rgba(47,151,247,0.6)' }} />
        {/* Second rule left — below heading */}
        <div className="absolute top-[310px] left-0 w-[calc(50%-260px)] h-px"
          style={{ background: 'linear-gradient(to right, transparent 0%, rgba(47,151,247,0.25) 100%)' }} />
        {/* Second rule right */}
        <div className="absolute top-[310px] right-0 w-[calc(50%-260px)] h-px"
          style={{ background: 'linear-gradient(to left, transparent 0%, rgba(47,151,247,0.25) 100%)' }} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-5 py-2.5 mb-5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm font-medium [box-shadow:0_4px_20px_rgba(47,151,247,0.2),inset_0_-1px_0_rgba(47,151,247,0.6)]">
            <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
            Pricing
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="text-6xl md:text-7xl font-bold leading-tight mb-5"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <span className="block text-white">Fair pricing,</span>
            <span className="text-gradient-blue-purple">every team size</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-base text-white/45 max-w-md mx-auto mb-2">
            Pricing finalised at launch. Join the waitlist for exclusive early access rates.
          </motion.p>
        </motion.div>

        {/* Cards grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="grid md:grid-cols-3 gap-5"
        >
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ y: -6, boxShadow: '0 0 0 1px rgba(37,99,235,0.35), 0 24px 48px rgba(0,0,0,0.6)', transition: { type: 'spring', stiffness: 300, damping: 24 } }}
                className="relative rounded-2xl flex flex-col overflow-hidden"
                style={{ background: '#060d18', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                {/* Dot grid texture */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.07]"
                  style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                {/* Top edge accent line */}
                <div className="absolute top-0 left-[20%] right-[20%] h-px pointer-events-none"
                  style={{ background: 'linear-gradient(to right, transparent, rgba(37,99,235,0.6) 50%, transparent)' }} />
                {/* Bottom-right corner glow */}
                <div className="absolute bottom-0 right-0 w-64 h-64 pointer-events-none"
                  style={{ background: 'radial-gradient(circle at 100% 100%, rgba(37,99,235,0.12) 0%, transparent 65%)' }} />
                {/* Top-left soft glow */}
                <div className="absolute top-0 left-0 w-40 h-40 pointer-events-none"
                  style={{ background: 'radial-gradient(circle at 0% 0%, rgba(37,99,235,0.07) 0%, transparent 70%)' }} />
                <div className="p-7 flex flex-col h-full relative z-10">
                  {/* Icon + badge */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[#111e35] border border-white/[0.08] flex items-center justify-center">
                      <Icon className={`w-5 h-5 ${plan.iconColor}`} />
                    </div>
                    {plan.badge && (
                      <span className="px-3 py-1.5 rounded-lg bg-white/[0.07] border border-white/[0.1] text-xs font-medium text-white/80">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  {/* Plan name */}
                  <h3 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                    {plan.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-bold text-white">{plan.price}</span>
                    <span className="text-sm text-white/35">{plan.period}</span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-white/45 leading-relaxed mb-5">{plan.desc}</p>

                  {/* Stats pills */}
                  <div className="flex gap-2 flex-wrap mb-6">
                    {plan.stats.map((s) => (
                      <span key={s} className="px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-xs font-medium text-white/65">
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f.text} className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          f.active ? 'bg-[#2563eb]' : 'bg-white/[0.07]'
                        }`}>
                          <Check className={`w-3 h-3 ${f.active ? 'text-white' : 'text-white/30'}`} />
                        </div>
                        <span className={`text-sm ${f.active ? 'text-white/85' : 'text-white/30'}`}>{f.text}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-colors"
                    style={{ background: '#2563eb' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#1d4ed8')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#2563eb')}>
                    {plan.cta}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center text-xs text-white/50 mt-10"
        >
          All plans include a 14-day free trial.{' '}
          <span className="text-white/35">No credit card required.</span>
        </motion.p>
      </div>
    </section>
  );
}
