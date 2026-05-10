'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Menu, X, Rocket } from 'lucide-react';
import { BrandLogoFull } from '@/components/brand-logo';
import { brand } from '@/lib/brand';

const LAUNCH_DATE = new Date('2026-05-05T00:00:00Z');
function getCountdown() {
  const diff = Math.max(LAUNCH_DATE.getTime() - Date.now(), 0);
  return {
    d: Math.floor(diff / (1000 * 60 * 60 * 24)),
    h: Math.floor((diff / (1000 * 60 * 60)) % 24),
    m: Math.floor((diff / (1000 * 60)) % 60),
    s: Math.floor((diff / 1000) % 60),
  };
}

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [countdown, setCountdown] = useState(getCountdown());

  useEffect(() => {
    const id = setInterval(() => setCountdown(getCountdown()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      setVisible(current < lastScrollY.current || current < 60);
      lastScrollY.current = current;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Features', href: '#features' },
    { label: 'Report', href: '#demo' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'About', href: '#about' },
    { label: 'Privacy', href: '/privacy-policy' },
    { label: 'Terms', href: '/terms-and-conditions' },
  ];

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 w-full px-4 pt-3 z-50"
      animate={{ y: visible ? 0 : -130, opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* ── Announcement bar ── */}
      <div className="max-w-[1400px] mx-auto mb-2">
        <div
          className="flex items-center justify-center gap-2.5 px-4 py-1.5 rounded-xl backdrop-blur-md"
          style={{
            background: 'rgba(47,151,247,0.20)',
            border: '1px solid rgba(47,151,247,0.20)',
            boxShadow: '0 0 24px rgba(47,151,247,0.10)',
            filter: 'blur(0.3)'
          }}
        >
          <motion.span
            animate={{ rotate: [0, 15, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
          >
            <Rocket className="w-3.5 h-3.5 text-brand flex-shrink-0" />
          </motion.span>
          <span className="text-[11px] text-white/55 font-medium">Launching in</span>
          <span className="font-mono font-bold text-brand text-[12px] tracking-tight tabular-nums">
            {String(countdown.d).padStart(2, '0')}d&nbsp;
            {String(countdown.h).padStart(2, '0')}h&nbsp;
            {String(countdown.m).padStart(2, '0')}m&nbsp;
            {String(countdown.s).padStart(2, '0')}s
          </span>
          <span
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold text-brand"
            style={{ background: 'rgba(47,151,247,0.12)', border: '1px solid rgba(47,151,247,0.28)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            Early Access
          </span>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto">
        {/* Floating navbar card */}
        <div
          className="relative rounded-2xl border border-brand/20 bg-black/55 backdrop-blur-md overflow-hidden glow-blue-card"
        >
          {/* Top edge glow line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/70 to-transparent" />

          <div className="flex items-center justify-between px-9 py-4">

            {/* Logo */}
            <BrandLogoFull href="/" />

            {/* Desktop nav links */}
            <nav className="hidden md:flex items-center gap-7">
              {links.map((l) => (
                l.href.startsWith('/') ? (
                  <Link
                    key={l.label}
                    href={l.href}
                    className="relative text-sm font-medium text-white/55 hover:text-white transition-colors duration-200 group"
                  >
                    {l.label}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-brand group-hover:w-full transition-all duration-300 rounded-full" />
                  </Link>
                ) : (
                  <a
                    key={l.label}
                    href={l.href}
                    className="relative text-sm font-medium text-white/55 hover:text-white transition-colors duration-200 group"
                  >
                    {l.label}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-brand group-hover:w-full transition-all duration-300 rounded-full" />
                  </a>
                )
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href={brand.links.login}
                className="text-sm font-medium text-white/55 hover:text-white transition-colors duration-200"
              >
                Sign In
              </a>
              <a
                href={brand.links.register}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-xl btn-primary"
              >
                Get Started <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Mobile toggle */}
            <button
              className="md:hidden p-2 rounded-lg text-white/55 hover:text-white hover:bg-white/5 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile dropdown */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="md:hidden overflow-hidden border-t border-brand/10"
              >
                <div className="px-6 py-4 space-y-1">
                  {links.map((l) => (
                    <a
                      key={l.label}
                      href={l.href}
                      className="block py-2.5 text-sm text-white/55 hover:text-white font-medium transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      {l.label}
                    </a>
                  ))}
                  <Link
                    href="/privacy-policy"
                    className="block py-2.5 text-sm text-white/55 hover:text-white font-medium transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    href="/terms-and-conditions"
                    className="block py-2.5 text-sm text-white/55 hover:text-white font-medium transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    Terms &amp; Conditions
                  </Link>
                  <a
                    href={brand.links.register}
                    className="block mt-3 py-3 text-center text-white rounded-xl text-sm font-semibold btn-primary"
                    onClick={() => setMenuOpen(false)}
                  >
                    Get Started
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
