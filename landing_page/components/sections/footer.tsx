'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Linkedin, Github, Twitter, Mail, Send } from 'lucide-react';
import { BrandLogoFull } from '@/components/brand-logo';
import { brand } from '@/lib/brand';

export function Footer() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="w-full px-4 pb-5 pt-4">
      <footer className="relative max-w-7xl mx-auto rounded-2xl border border-brand/20 bg-black overflow-hidden glow-blue-footer">

        {/* Top edge glow line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/80 to-transparent" />

        {/* Wide spotlight cone */}
        <div className="footer-spotlight absolute -top-px left-0 right-0 w-full h-[420px] pointer-events-none" />

        {/* Main grid */}
        <div className="relative px-8 pt-12 pb-0">
          <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr_1fr_1.4fr] gap-10 pb-10">

            {/* Brand column */}
            <div>
              <div className="mb-5">
                <BrandLogoFull href="/" textSize="text-lg" />
              </div>
              {/* Horizontal divider like reference */}
              <div className="w-full h-px bg-white/10 mb-5" />
              <p className="text-sm text-white/45 leading-relaxed mb-1">
                AI-powered candidate screening
              </p>
              <p className="text-sm text-white/45 leading-relaxed mb-5">
                built with purpose and passion.
              </p>
              <p className="text-sm text-white/55">
                &mdash; <strong className="text-white/70">FAST NUCES Karachi.</strong>
              </p>
            </div>

            {/* Product links */}
            <div>
              <h4 className="text-sm font-medium text-white/85 mb-5">Product</h4>
              <ul className="space-y-4">
                {[
                  { label: 'Features', href: '#features' },
                  { label: 'How It Works', href: '#how-it-works' },
                  { label: 'Sample Report', href: '/report' },
                  { label: 'Pricing', href: '#pricing' },
                  { label: 'Contact', href: '#contact' },
                ].map((item) => (
                  <li key={item.label}>
                    <a href={item.href} className="text-sm text-white/40 hover:text-white/75 transition-colors duration-200">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social links */}
            <div>
              <h4 className="text-sm font-medium text-white/85 mb-5">Connect</h4>
              <ul className="space-y-4">
                {[
                  { label: 'LinkedIn', href: '#', Icon: Linkedin },
                  { label: 'GitHub', href: '#', Icon: Github },
                  { label: 'Twitter / X', href: '#', Icon: Twitter },
                  { label: 'Email Us', href: 'mailto:intellihire@fast.edu.pk', Icon: Mail },
                ].map(({ label, href, Icon }) => (
                  <li key={label}>
                    <a href={href} className="flex items-center gap-2.5 text-sm text-white/40 hover:text-white/75 transition-colors duration-200 group">
                      <Icon className="w-3.5 h-3.5 flex-shrink-0 group-hover:text-brand transition-colors" />
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Subscribe form */}
            <div>
              <h4 className="text-sm font-medium text-white/85 mb-5">Join the Waitlist</h4>
              {submitted ? (
                <p className="text-sm text-brand font-medium">You&apos;re on the list! 🎉</p>
              ) : (
                <form
                  onSubmit={(e) => { e.preventDefault(); if (email.trim()) setSubmitted(true); }}
                  className="flex gap-2"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email..."
                    className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand/50 transition-colors"
                  />
                  <button
                    type="submit"
                    className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-sm font-semibold btn-primary"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Subscribe
                  </button>
                </form>
              )}
              <p className="text-xs text-white/45 mt-3"></p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="relative border-t border-white/8 px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/55">© 2026 IntelliHire. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms-and-conditions" className="text-xs text-white/55 hover:text-white/75 transition-colors">Terms &amp; Conditions</Link>
            <Link href="/privacy-policy" className="text-xs text-white/55 hover:text-white/75 transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
