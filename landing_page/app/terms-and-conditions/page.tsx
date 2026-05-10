import Link from 'next/link';
import { Brain } from 'lucide-react';

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-5">
        <div className="max-w-[1400px] mx-auto rounded-2xl border border-[#2f97f7]/20 bg-black/55 backdrop-blur-md overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2f97f7]/70 to-transparent" />
          <div className="relative flex items-center justify-between px-9 py-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-9 h-9 rounded-xl flex items-center justify-center border border-[#2f97f7]/35 bg-[#2f97f7]/10 transition-all duration-300 group-hover:bg-[#2f97f7]/20 group-hover:border-[#2f97f7]/60">
                <Brain className="w-5 h-5 text-[#2f97f7]" />
              </div>
              <span className="text-[17px] font-bold tracking-tight text-white font-display">
                Intelli<span className="text-[#2f97f7]">Hire</span>
              </span>
            </Link>

            <div className="flex items-center gap-5">
              <Link
                href="/"
                className="text-sm font-medium text-white/65 hover:text-white transition-colors duration-200"
              >
                Home
              </Link>
              <Link
                href="/privacy-policy"
                className="text-sm font-medium text-white/65 hover:text-white transition-colors duration-200"
              >
                Privacy
              </Link>
              <Link
                href="/terms-and-conditions"
                className="text-sm font-medium text-white/65 hover:text-white transition-colors duration-200"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="relative overflow-hidden px-6 pt-36 pb-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[1100px] h-[520px] bg-[radial-gradient(ellipse_65%_55%_at_50%_0%,rgba(47,151,247,0.13)_0%,rgba(167,139,250,0.08)_40%,transparent_72%)]" />
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle,rgba(255,255,255,0.75)_1px,transparent_1px)] [background-size:34px_34px]" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="mb-10 text-center">
            <p className="inline-flex items-center gap-2 px-5 py-2.5 mb-5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm font-medium">
              Legal
            </p>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Terms &amp;{' '}
              <span className="bg-[linear-gradient(90deg,#2f97f7_0%,#a78bfa_100%)] bg-clip-text text-transparent">
                Conditions
              </span>
            </h1>
            <p className="text-white/60 text-sm">Effective date: April 11, 2026</p>
            <p className="text-white/60 text-sm">Last updated: April 11, 2026</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 md:p-10 shadow-[0_0_50px_rgba(47,151,247,0.1)] space-y-8 text-white/80 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-white mb-2">1. Acceptance of Terms</h2>
              <p>
                By accessing or using IntelliHire, you agree to these Terms. If you do not agree, do not use the
                service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">2. Service Description</h2>
              <p>
                IntelliHire provides AI-powered recruitment workflows including candidate screening, interview support,
                report generation, and a RAG-based assistant for company documents.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">3. User Responsibilities</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>You must provide accurate information and maintain account security.</li>
                <li>You are responsible for legal rights to all uploaded candidate and company data.</li>
                <li>You must not use the service for unlawful, discriminatory, or abusive practices.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">4. AI Outputs and Human Review</h2>
              <p>
                AI-generated recommendations and chatbot responses are decision-support tools. Final hiring and
                policy decisions must be reviewed and approved by authorized human personnel.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">5. Intellectual Property</h2>
              <p>
                IntelliHire branding, software, and platform content are protected by applicable intellectual property
                laws. Clients retain ownership of their uploaded content and data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">6. Availability and Changes</h2>
              <p>
                We may modify features, pricing, or availability at any time. We aim for high uptime but do not
                guarantee uninterrupted or error-free service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">7. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, IntelliHire is not liable for indirect or consequential losses
                arising from use of the platform, including hiring outcomes based solely on automated suggestions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">8. Termination</h2>
              <p>
                We may suspend or terminate access for violations of these Terms or misuse of the platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">9. Contact</h2>
              <p>
                For legal inquiries:{' '}
                <a href="mailto:intellihire@fast.edu.pk" className="text-[#2f97f7] hover:text-[#67b7ff]">
                  intellihire@fast.edu.pk
                </a>
              </p>
            </section>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4 text-sm justify-center">
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl border border-white/15 text-white/80 hover:text-white hover:border-white/25 transition-colors"
            >
              Back to Home
            </Link>
            <Link
              href="/privacy-policy"
              className="px-5 py-2.5 rounded-xl border border-[#2f97f7]/30 text-[#2f97f7] hover:text-[#67b7ff] hover:border-[#67b7ff]/50 transition-colors"
            >
              View Privacy Policy
            </Link>
          </div>
        </div>

      </main>

      <footer className="w-full px-4 pb-5 pt-4">
        <div className="relative max-w-7xl mx-auto rounded-2xl border border-[#2f97f7]/20 bg-black overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2f97f7]/80 to-transparent" />
          <div className="relative px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/55">© 2026 IntelliHire. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/" className="text-xs text-white/55 hover:text-white/75 transition-colors">
                Home
              </Link>
              <Link href="/privacy-policy" className="text-xs text-white/55 hover:text-white/75 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-and-conditions" className="text-xs text-white/55 hover:text-white/75 transition-colors">
                Terms &amp; Conditions
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
