'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, Send, Loader2, AlertCircle } from 'lucide-react';
import { CpuArchitecture } from '@/components/ui/cpu-architecture';
import { BackgroundPaths } from '@/components/ui/background-paths';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export function CTASection() {
  const [formData, setFormData] = useState({
    full_name: '', work_email: '', company_name: '', phone: '',
    selected_plan: 'starter',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name.trim() || !formData.work_email.trim() || !formData.company_name.trim() || !formData.phone.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/admin/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="relative py-28 px-6 overflow-hidden bg-black">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-brand/8 rounded-full blur-[130px]" />
        {/* Central CPU — paths converge on the button */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] opacity-[0.30]">
          <CpuArchitecture width="700" height="700" text="" className="w-full h-full" />
        </div>
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Animated paths on dark bg */}
      <BackgroundPaths className="opacity-[0.15]" variant="dark" />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.75 }}
        className="max-w-2xl mx-auto text-center relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border border-brand/30 bg-brand/10 text-brand text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          Now accepting early access signups
        </div>

        <h2
          className="text-5xl md:text-6xl font-bold mb-5 leading-[1.06] text-white"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Ready to transform
          <br />
          <span className="text-gradient-blue-purple">how you hire?</span>
        </h2>

        <p className="text-xl text-slate-400 mb-10 max-w-lg mx-auto leading-relaxed">
          Join the waitlist for early access. First 50 companies unlock 3 months free.
        </p>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-3 py-5 px-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold"
            >
              <Check className="w-5 h-5" />
              You are on the list! We will be in touch soon.
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              className="max-w-lg mx-auto space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  name="full_name"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Full name"
                  className="px-4 py-3.5 rounded-xl bg-white/[0.06] border border-white/[0.12] focus:border-brand/60 focus:bg-white/[0.08] outline-none text-sm transition-all duration-300 placeholder:text-white/30 text-white"
                />
                <input
                  type="email"
                  name="work_email"
                  required
                  value={formData.work_email}
                  onChange={handleChange}
                  placeholder="Work email"
                  className="px-4 py-3.5 rounded-xl bg-white/[0.06] border border-white/[0.12] focus:border-brand/60 focus:bg-white/[0.08] outline-none text-sm transition-all duration-300 placeholder:text-white/30 text-white"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  name="company_name"
                  required
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="Company name"
                  className="px-4 py-3.5 rounded-xl bg-white/[0.06] border border-white/[0.12] focus:border-brand/60 focus:bg-white/[0.08] outline-none text-sm transition-all duration-300 placeholder:text-white/30 text-white"
                />
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone number"
                  className="px-4 py-3.5 rounded-xl bg-white/[0.06] border border-white/[0.12] focus:border-brand/60 focus:bg-white/[0.08] outline-none text-sm transition-all duration-300 placeholder:text-white/30 text-white"
                />
              </div>
              <select
                name="selected_plan"
                value={formData.selected_plan}
                onChange={handleChange}
                className="w-full px-4 py-3.5 rounded-xl bg-white/[0.06] border border-white/[0.12] focus:border-brand/60 focus:bg-white/[0.08] outline-none text-sm transition-all duration-300 text-white/70 appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='rgba(255,255,255,0.4)' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
              >
                <option value="starter" className="bg-[#0b1120]">Starter Plan</option>
                <option value="professional" className="bg-[#0b1120]">Professional Plan</option>
                <option value="enterprise" className="bg-[#0b1120]">Enterprise Plan</option>
              </select>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="relative w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm whitespace-nowrap text-white btn-primary pulse-glow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {/* Beacon convergence rings */}
                <span className="absolute inset-0 rounded-2xl border border-brand/50 beacon-ring pointer-events-none" />
                <span className="absolute inset-0 rounded-2xl border border-brand/30 beacon-ring beacon-ring-2 pointer-events-none" />
                <span className="absolute inset-0 rounded-2xl border border-brand/20 beacon-ring beacon-ring-3 pointer-events-none" />
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Join Waitlist
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <p className="text-xs text-white/35 mt-5">No spam, no credit card. Unsubscribe anytime.</p>
      </motion.div>
    </section>
  );
}
