'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, MessageCircle, ArrowRight } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };

const faqs = [
  {
    q: 'How is candidate data stored and protected?',
    a: 'All interview recordings, transcripts, and personal data are encrypted at rest and in transit using AES-256. Data resides on secured cloud infrastructure with strict role-based access controls. We follow OWASP security best practices and are building towards full GDPR compliance.',
    tag: 'Security',
  },
  {
    q: 'Can we customise the interview questions?',
    a: 'Absolutely. Hiring managers define custom question banks, set required competencies, specify focus areas, and set the difficulty level. The AI uses your inputs to generate and adapt questions relevant to your exact job requirements and scoring criteria.',
    tag: 'Customisation',
  },
  {
    q: 'What if the AI misinterprets a candidate response?',
    a: 'Every score is accompanied by the exact transcript excerpt that generated it. HR managers can review, validate, and override any AI decision. The system flags low-confidence assessments for human review. AI assists — it never replaces — human judgment.',
    tag: 'AI & Scoring',
  },
  {
    q: 'Is IntelliHire GDPR compliant?',
    a: 'We are actively building GDPR compliance features including right-to-erasure requests, consent management, data processing agreements, and candidate data export. Full compliance documentation will be available before commercial launch.',
    tag: 'Compliance',
  },
  {
    q: 'How do candidates access their interviews?',
    a: 'Candidates receive a unique, time-limited secure link via email after scheduling. They access a branded candidate portal, review role requirements, test their microphone and camera, and begin the interview within their chosen scheduled window.',
    tag: 'Candidates',
  },
  {
    q: 'What languages are supported?',
    a: 'English and Urdu are fully supported for speech recognition via OpenAI Whisper. Question generation operates in English in the initial release. Arabic, French, and Spanish support is on the roadmap based on user demand.',
    tag: 'Languages',
  },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-28 px-6 bg-black overflow-hidden">

      {/* ── Background atmosphere ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top-left glow */}
        <div className="absolute -top-16 -left-24 w-[480px] h-[480px]"
          style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.09) 0%, transparent 65%)' }} />
        {/* Top-right glow */}
        <div className="absolute -top-8 -right-16 w-[360px] h-[360px]"
          style={{ background: 'radial-gradient(circle, rgba(47,151,247,0.06) 0%, transparent 65%)' }} />
        {/* Subtle dot grid */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        {/* Horizontal rule across center */}
        <div className="absolute top-1/2 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(to right, transparent 0%, rgba(47,151,247,0.06) 30%, rgba(47,151,247,0.06) 70%, transparent 100%)' }} />
      </div>

      <div className="max-w-6xl mx-auto relative">

        {/* ── Two-column layout ── */}
        <div className="grid lg:grid-cols-[1fr_1.5fr] gap-16 items-start">

          {/* ── LEFT: Sticky heading panel ── */}
          <div className="lg:sticky lg:top-28">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={stagger}
            >
              {/* Vertical connector */}
              <motion.div variants={fadeUp} className="flex flex-col items-start mb-3">
                <div style={{ width: 1, height: 36, background: 'linear-gradient(to bottom, transparent, rgba(47,151,247,0.7))' }} />
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-brand)', boxShadow: '0 0 10px 3px rgba(47,151,247,0.55)', marginTop: 3 }} />
              </motion.div>

              {/* Badge */}
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm font-medium [box-shadow:0_4px_20px_rgba(47,151,247,0.2),inset_0_-1px_0_rgba(47,151,247,0.6)]">
                <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                FAQ
              </motion.div>

              {/* Heading */}
              <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold leading-tight font-display mb-4">
                <span className="text-white">Frequently</span><br />
                <span className="text-white">asked </span>
                <span style={{ background: 'linear-gradient(90deg, var(--color-brand) 0%, #a78bfa 50%, #e879f9 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>questions</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-white/45 text-[15px] leading-relaxed mb-10">
                Everything you need to know about IntelliHire before getting started. Can't find the answer you're looking for?
              </motion.p>
              {/* Stats row */}
              <motion.div variants={fadeUp} className="flex gap-6 mb-10">
                {[
                  { val: '6', label: 'Topics covered' },
                  { val: '24h', label: 'Support response' },
                ].map((s, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="text-2xl font-bold text-white">{s.val}</span>
                    <span className="text-xs text-white/35 mt-0.5">{s.label}</span>
                  </div>
                ))}
              </motion.div>

              {/* CTA card */}
              <motion.div
                variants={fadeUp}
                className="rounded-2xl p-5 flex items-start gap-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(37,99,235,0.1) 0%, rgba(47,151,247,0.05) 100%)',
                  border: '1px solid rgba(47,151,247,0.22)',
                  boxShadow: '0 0 32px rgba(37,99,235,0.1)',
                }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(47,151,247,0.15)', border: '1px solid rgba(47,151,247,0.3)' }}>
                  <MessageCircle className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-semibold mb-0.5">Still have questions?</p>
                  <p className="text-white/45 text-xs leading-relaxed mb-3">Our team responds within 24 hours.</p>
                  <a
                    href="#contact"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
                    style={{ color: 'var(--color-brand)' }}
                  >
                    Get in touch <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* ── RIGHT: Accordion ── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={stagger}
            className="space-y-2.5"
          >
            {faqs.map((faq, i) => {
              const isOpen = open === i;
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="relative rounded-2xl overflow-hidden"
                  style={{
                    background: isOpen
                      ? 'linear-gradient(135deg, rgba(37,99,235,0.09) 0%, rgba(47,151,247,0.04) 100%)'
                      : 'rgba(255,255,255,0.03)',
                    border: isOpen
                      ? '1px solid rgba(47,151,247,0.3)'
                      : '1px solid rgba(255,255,255,0.07)',
                    boxShadow: isOpen ? '0 4px 32px rgba(37,99,235,0.13), inset 0 0 0 1px rgba(47,151,247,0.04)' : 'none',
                    transition: 'background 0.3s, border-color 0.3s, box-shadow 0.3s',
                  }}
                >
                  {/* Left accent bar */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-[3px]"
                    style={{
                      background: isOpen ? 'linear-gradient(to bottom, #2563eb, var(--color-brand))' : 'transparent',
                      borderRadius: '0 0 0 16px',
                      transition: 'background 0.3s',
                    }}
                  />

                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Number */}
                      <span
                        className="flex-shrink-0 text-[11px] font-bold tabular-nums w-5"
                        style={{ color: isOpen ? 'var(--color-brand)' : 'rgba(255,255,255,0.18)' }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        {/* Tag */}
                        <span
                          className="inline-block text-[10px] font-bold uppercase tracking-widest mb-1 px-2 py-0.5 rounded-full"
                          style={{
                            color: isOpen ? 'var(--color-brand)' : 'rgba(255,255,255,0.25)',
                            background: isOpen ? 'rgba(47,151,247,0.1)' : 'rgba(255,255,255,0.05)',
                            border: isOpen ? '1px solid rgba(47,151,247,0.2)' : '1px solid rgba(255,255,255,0.07)',
                            transition: 'all 0.2s',
                          }}
                        >
                          {faq.tag}
                        </span>
                        <p className={`font-semibold text-sm leading-snug transition-colors duration-200 ${isOpen ? 'text-white' : 'text-white/70'}`}>
                          {faq.q}
                        </p>
                      </div>
                    </div>

                    {/* Toggle icon */}
                    <div
                      className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{
                        background: isOpen ? 'rgba(47,151,247,0.18)' : 'rgba(255,255,255,0.05)',
                        border: isOpen ? '1px solid rgba(47,151,247,0.4)' : '1px solid rgba(255,255,255,0.09)',
                        transition: 'all 0.25s',
                      }}
                    >
                      {isOpen
                        ? <Minus className="w-3 h-3" style={{ color: 'var(--color-brand)' }} />
                        : <Plus className="w-3 h-3 text-white/35" />}
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="mx-6 h-px mb-3"
                          style={{ background: 'linear-gradient(to right, rgba(47,151,247,0.3), rgba(47,151,247,0.05), transparent)' }} />
                        <p className="px-6 pb-5 pl-14 text-sm text-white/55 leading-relaxed">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}

            {/* Bottom note inside the accordion column */}
            <motion.p
              variants={fadeUp}
              className="text-center text-white/20 text-xs pt-3"
            >
              {faqs.length} questions · answers updated April 2026
            </motion.p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
