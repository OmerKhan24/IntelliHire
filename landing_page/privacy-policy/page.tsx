import Link from 'next/link';
import { Brain } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
          <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[1100px] h-[520px] bg-[radial-gradient(ellipse_65%_55%_at_50%_0%,rgba(47,151,247,0.14)_0%,rgba(167,139,250,0.09)_40%,transparent_72%)]" />
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle,rgba(255,255,255,0.75)_1px,transparent_1px)] [background-size:34px_34px]" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="mb-10 text-center">
            <p className="inline-flex items-center gap-2 px-5 py-2.5 mb-5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm font-medium">
              Legal
            </p>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Privacy{' '}
              <span className="bg-[linear-gradient(90deg,#2f97f7_0%,#a78bfa_100%)] bg-clip-text text-transparent">
                Policy
              </span>
            </h1>
            <p className="text-white/60 text-sm">Effective date: April 11, 2026</p>
            <p className="text-white/60 text-sm">Last updated: April 11, 2026</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 md:p-10 shadow-[0_0_50px_rgba(47,151,247,0.1)] space-y-8 text-white/80 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-white mb-2">1. Overview</h2>
              <p>
                IntelliHire (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) provides AI-powered hiring tools including resume
                screening, interview analytics, and a document-grounded chatbot for company teams.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">2. Information We Collect</h2>
              <p>We may collect:</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Account information (name, email, company details).</li>
                <li>Recruitment data (job posts, candidate resumes, interview transcripts, scores).</li>
                <li>Company documents uploaded for chatbot retrieval (policies, handbooks, SOPs).</li>
                <li>Technical data (IP address, browser, device, usage logs).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">3. How We Use Data</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Provide and improve hiring automation and chatbot responses.</li>
                <li>Generate rankings, analytics, and interview insights.</li>
                <li>Maintain platform security, monitor abuse, and ensure service quality.</li>
                <li>Communicate updates, support responses, and product notices.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">4. RAG Chatbot Data Handling</h2>
              <p>
                Uploaded company documents are indexed so the chatbot can retrieve relevant passages before
                generating responses. We use retrieval-augmented generation to reduce hallucinations and ground
                answers in your provided content.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">5. Data Sharing</h2>
              <p>
                We do not sell personal data. We may share data with trusted service providers (hosting,
                storage, analytics, AI inference) strictly to operate the platform and under confidentiality obligations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">6. Data Retention</h2>
              <p>
                We retain data only as long as needed for service delivery, legal obligations, and legitimate business
                purposes. Clients may request deletion of their organizational data subject to compliance requirements.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">7. Security</h2>
              <p>
                We apply reasonable technical and organizational safeguards to protect data. No system is 100%
                secure, but we continuously improve controls and monitoring.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">8. Your Rights</h2>
              <p>
                Depending on jurisdiction, users may have rights to access, correct, or delete personal data, and to
                object to certain processing activities.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">9. Contact</h2>
              <p>
                Privacy requests and questions:{' '}
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
              href="/terms-and-conditions"
              className="px-5 py-2.5 rounded-xl border border-[#2f97f7]/30 text-[#2f97f7] hover:text-[#67b7ff] hover:border-[#67b7ff]/50 transition-colors"
            >
              View Terms &amp; Conditions
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
