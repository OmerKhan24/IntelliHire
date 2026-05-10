'use client';

import { motion } from 'framer-motion';

const techs = [
  {
    name: 'Python',
    bg: '#3b6e9e',
    svg: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
        <path d="M11.9 2C9.1 2 7 3.1 7 4.5V7h5v1H4.5C3.1 8 2 9.5 2 11.9c0 2.4 1.1 3.8 2.5 3.8H6v-2.4c0-1.5 1.1-2.4 2.4-2.4H14c1.3 0 2-.7 2-2V4.5C16 3.1 14.2 2 11.9 2zm-1.4 1.8c.5 0 .9.4.9.9s-.4.9-.9.9-.9-.4-.9-.9.4-.9.9-.9zM17 9v2.4c0 1.5-1.1 2.4-2.4 2.4H9c-1.3 0-2 .7-2 2v3.7C7 20.9 8.8 22 11.9 22c2.8 0 4.9-1.1 4.9-2.5V17h-5v-1h7.5c1.4 0 2.6-1.5 2.6-3.9C22 9.7 20.9 9 19.5 9H17zm-3.5 10.3c.5 0 .9.4.9.9s-.4.9-.9.9-.9-.4-.9-.9.4-.9.9-.9z"/>
      </svg>
    ),
  },
  {
    name: 'FastAPI',
    bg: '#059669',
    svg: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
        <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm-.624 21.408v-7.908H6.24L13.008 2.4v8.4h4.8l-6.432 10.608z"/>
      </svg>
    ),
  },
  {
    name: 'PyTorch',
    bg: '#ee4c2c',
    svg: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
        <path d="M12.005 0L4.952 7.053a9.865 9.865 0 000 14.01 9.865 9.865 0 0014.01 0 9.865 9.865 0 000-14.01l-1.905 1.905a7.29 7.29 0 010 10.2 7.29 7.29 0 01-10.2 0 7.29 7.29 0 010-10.2l5.148-5.153zM15 3.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z"/>
      </svg>
    ),
  },
  {
    name: 'OpenCV',
    bg: '#5c3d99',
    svg: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
        <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 3a7 7 0 110 14A7 7 0 0112 5zm0 2a5 5 0 100 10A5 5 0 0012 7zm0 2a3 3 0 110 6 3 3 0 010-6z"/>
      </svg>
    ),
  },
  {
    name: 'Next.js',
    bg: '#333',
    svg: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
        <path d="M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 01-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 00-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.109 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.25 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 00-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 01-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 01-.157-.171l-.05-.106.006-4.703.007-4.705.072-.092a.645.645 0 01.174-.143c.096-.047.134-.051.54-.051.478 0 .558.018.682.154.035.038 1.337 1.999 2.895 4.361a10760.433 10760.433 0 004.735 7.17l1.9 2.879.096-.063a12.317 12.317 0 002.466-2.163 11.944 11.944 0 002.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747-.652-4.506-3.859-8.292-8.208-9.695a12.597 12.597 0 00-2.499-.523A33.119 33.119 0 0011.573 0zm4.069 7.217c.347 0 .408.005.486.047a.473.473 0 01.237.277c.018.06.023 1.365.018 4.304l-.006 4.218-.744-1.14-.746-1.14v-3.066c0-1.982.01-3.097.023-3.15a.478.478 0 01.233-.296c.096-.05.13-.054.5-.054z"/>
      </svg>
    ),
  },
  {
    name: 'React',
    bg: '#1a9fca',
    svg: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
        <path d="M12 9.861A2.139 2.139 0 1012 14.139 2.139 2.139 0 1012 9.861zM6.008 16.255l-.472-.12C2.018 15.246 0 13.737 0 11.996s2.018-3.25 5.536-4.139l.472-.12.132.468a23.53 23.53 0 001.363 3.578 23.442 23.442 0 00-1.363 3.578l-.132.468-.468-.132zm11.084 0l-.132-.468a23.7 23.7 0 00-1.363-3.578 23.53 23.53 0 001.363-3.578l.132-.468.468.132C20.982 9.25 23 10.758 23 12s-2.018 3.25-5.536 4.139l-.472.12zM7.243 20.466C9.06 19.166 10.497 18.5 12 18.5s2.94.666 4.757 1.966l.364.272-.272.364C15.28 22.52 13.578 23 12 23c-1.578 0-3.28-.48-4.849-1.898l-.272-.364.364-.272zM12 5.5c-1.503 0-2.94-.666-4.757-1.966l-.364-.272.272-.364C8.72 1.48 10.422 1 12 1c1.578 0 3.28.48 4.849 1.898l.272.364-.364.272C14.94 4.834 13.503 5.5 12 5.5z"/>
      </svg>
    ),
  },
  {
    name: 'PostgreSQL',
    bg: '#336791',
    svg: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
        <path d="M15.61 13.277c-.105 1.303-.158 2.218-.126 2.656.038.438.105.72.198.844.093.125.24.188.441.188.183 0 .436-.094.759-.282.324-.188.66-.563 1.01-1.126.348-.563.638-1.313.87-2.25a9.9 9.9 0 00.345-2.625c0-.813-.077-1.548-.23-2.203-.153-.656-.428-1.183-.826-1.579a2.038 2.038 0 00-.47-.332C17.24 6.42 17 6.375 12.814 6.375c0 0-3.047.048-4.11.048-1.065 0-1.94.375-2.626 1.125-.686.75-1.028 1.725-1.028 2.925 0 1.2.342 2.175 1.028 2.925.685.75 1.561 1.125 2.625 1.125h1.688v2.813c0 .562.094.937.281 1.125.188.187.469.281.844.281h.563c.375 0 .656-.094.844-.281.188-.188.281-.563.281-1.125V13.5h1.407zm-1.407-5.902c.75 0 1.359.234 1.828.703.469.469.703 1.078.703 1.828 0 .75-.234 1.36-.703 1.828-.469.47-1.078.703-1.828.703-.75 0-1.36-.234-1.828-.703-.469-.469-.703-1.078-.703-1.828 0-.75.234-1.36.703-1.828.469-.47 1.078-.703 1.828-.703z"/>
      </svg>
    ),
  },
  {
    name: 'OpenAI',
    bg: '#10a37f',
    svg: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
        <path d="M22.282 9.821a5.985 5.985 0 00-.516-4.91 6.046 6.046 0 00-6.51-2.9A6.065 6.065 0 0011.39.97a5.994 5.994 0 00-5.727 4.174 5.99 5.99 0 00-3.99 2.9 6.046 6.046 0 00.742 7.085 5.98 5.98 0 00.521 4.911 6.051 6.051 0 006.511 2.9A5.985 5.985 0 0013.25 23c2.059.005 3.9-1.316 4.51-3.176a5.99 5.99 0 003.99-2.9 6.046 6.046 0 00-.747-7.077zm-9.021 12.248a4.473 4.473 0 01-2.871-1.048l.142-.081 4.764-2.75a.775.775 0 00.393-.681V9.815l2.016 1.164a.071.071 0 01.038.052v5.563a4.504 4.504 0 01-4.482 4.475zm-9.668-4.124a4.47 4.47 0 01-.535-3.014l.142.085 4.764 2.75a.775.775 0 00.785 0l5.819-3.35v2.328a.07.07 0 01-.028.061l-4.82 2.783a4.504 4.504 0 01-6.127-1.643zm-1.252-10.14a4.47 4.47 0 012.34-1.968v5.62a.77.77 0 00.393.681l5.798 3.345-2.017 1.163a.07.07 0 01-.067 0L3.62 13.378a4.504 4.504 0 01-.279-5.573zm16.691 3.864l-5.797-3.35 2.016-1.162a.07.07 0 01.067 0l4.764 2.751a4.5 4.5 0 01-.692 7.215v-5.608a.771.771 0 00-.358-.646zm2.003-3.026l-.142-.085-4.764-2.748a.776.776 0 00-.786 0L9.52 9.197V6.87a.07.07 0 01.028-.061l4.819-2.782a4.506 4.506 0 016.128 1.643zm-12.63 4.151l-2.016-1.163a.071.071 0 01-.038-.052V6.87a4.5 4.5 0 017.375-3.454l-.142.08-4.764 2.751a.775.775 0 00-.394.682zm1.096-2.366l2.587-1.492 2.587 1.493v2.983l-2.587 1.492-2.587-1.492z"/>
      </svg>
    ),
  },
  {
    name: 'LangChain',
    bg: '#1c7a4b',
    svg: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    ),
  },
  {
    name: 'YOLOv8',
    bg: '#7c3aed',
    svg: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
        <path d="M1 1h6v6H1V1zm0 8h6v6H1V9zm0 8h6v6H1v-6zM9 1h6v6H9V1zm0 8h6v6H9V9zm0 8h6v6H9v-6zM17 1h6v6h-6V1zm0 8h6v6h-6V9zm0 8h6v6h-6v-6z" opacity=".4"/><rect x="7" y="7" width="10" height="10" rx="1"/>
      </svg>
    ),
  },
  {
    name: 'Tailwind',
    bg: '#0ea5e9',
    svg: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
        <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z"/>
      </svg>
    ),
  },
  {
    name: 'Whisper',
    bg: '#2563eb',
    svg: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
        <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM6.5 10a.5.5 0 00-1 0 6.5 6.5 0 0013 0 .5.5 0 00-1 0 5.5 5.5 0 01-11 0zM12 19a.5.5 0 01-.5-.5v-2a.5.5 0 011 0v2A.5.5 0 0112 19zm-3 2h6a.5.5 0 000-1H9a.5.5 0 000 1z"/>
      </svg>
    ),
  },
  {
    name: 'JWT',
    bg: '#d63aff',
    svg: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
        <path d="M10.628 1.077L9.28 5.356H4.79l3.72 2.704-1.421 4.37 3.539-2.57 3.54 2.57-1.422-4.37 3.72-2.704h-4.49zm0 12.04l-1.056 3.251-3.21.052 2.594 1.888-1.003 3.175 2.675-1.951 2.676 1.951-1.003-3.175 2.594-1.888-3.21-.052z"/>
      </svg>
    ),
  },
  {
    name: 'GitHub',
    bg: '#24292e',
    svg: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
      </svg>
    ),
  },
  {
    name: 'SQLAlchemy',
    bg: '#b22222',
    svg: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
        <ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v4c0 1.657 3.582 3 8 3s8-1.343 8-3V5"/><path d="M4 9v4c0 1.657 3.582 3 8 3s8-1.343 8-3V9"/><path d="M4 13v4c0 1.657 3.582 3 8 3s8-1.343 8-3v-4"/>
      </svg>
    ),
  },
];

export function TechStrip() {
  const items = [...techs, ...techs, ...techs];

  return (
    <section className="relative py-20 px-6 bg-black overflow-hidden">
      {/* outer section glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(37,99,235,0.07) 0%, transparent 70%)',
      }} />

      <div className="max-w-6xl mx-auto">
        {/* ── Rectangular card ── */}
        <div className="relative overflow-hidden rounded-2xl"
          style={{
            background: '#000',
            border: '1px solid rgba(37,99,235,0.18)',
            boxShadow: '0 0 0 1px rgba(37,99,235,0.08), 0 32px 80px rgba(0,0,0,0.6)',
          }}>

          {/* Blue grid — same as hero */}
          <div className="absolute inset-0 z-0 pointer-events-none" style={{
            backgroundImage: 'linear-gradient(rgba(37,99,235,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.05) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }} />

          {/* Orb 1 — top-center, drifts */}
          <motion.div className="absolute rounded-full z-0 pointer-events-none"
            style={{
              width: 700, height: 500,
              top: '-20%', left: '50%', x: '-50%',
              background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.32) 0%, rgba(37,99,235,0.1) 45%, transparent 72%)',
              filter: 'blur(72px)',
            }}
            animate={{ y: [0, 40, -20, 0], x: ['-50%', '-46%', '-54%', '-50%'] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Orb 2 — left, counter-drift */}
          <motion.div className="absolute rounded-full z-0 pointer-events-none"
            style={{
              width: 500, height: 500,
              top: '10%', left: '-15%',
              background: 'radial-gradient(circle, rgba(47,151,247,0.2) 0%, rgba(37,99,235,0.06) 55%, transparent 75%)',
              filter: 'blur(90px)',
            }}
            animate={{ x: [0, 50, 15, 0], y: [0, -40, 30, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />

          {/* Orb 3 — top-right */}
          <motion.div className="absolute rounded-full z-0 pointer-events-none"
            style={{
              width: 450, height: 400,
              top: '-10%', right: '-8%',
              background: 'radial-gradient(circle, rgba(14,165,233,0.18) 0%, rgba(37,99,235,0.06) 50%, transparent 70%)',
              filter: 'blur(80px)',
            }}
            animate={{ x: [0, -35, 15, 0], y: [0, 45, -25, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          />

          {/* Orb 4 — bottom, slow pulse */}
          <motion.div className="absolute rounded-full z-0 pointer-events-none"
            style={{
              width: 600, height: 300,
              bottom: '0%', left: '50%', x: '-50%',
              background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.14) 0%, transparent 65%)',
              filter: 'blur(60px)',
            }}
            animate={{ scale: [1, 1.15, 0.95, 1], y: [0, -25, 15, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />

          {/* Header */}
          <div className="relative z-10 flex flex-col items-center text-center px-8 pt-16 pb-12">

            {/* Badge — same style as all other sections */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 mb-5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm font-medium [box-shadow:0_4px_20px_rgba(47,151,247,0.2),inset_0_-1px_0_rgba(47,151,247,0.6)]">
              <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
              Integrations
            </div>

            {/* Heading — two-line style */}
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-5" style={{ fontFamily: 'var(--font-display)' }}>
              <span className="block text-white">Seamless Integrations for</span>
              <span className="text-gradient-blue-purple">Maximum Efficiency.</span>
            </h2>

            {/* Subheadline */}
            <p className="text-base text-white/45 max-w-md mx-auto mb-8">
              Our platform connects with leading tools and pipelines, ensuring a smooth and efficient workflow end-to-end.
            </p>

            {/* CTA — btn-primary class used across all sections */}
            <a href="#" className="btn-primary px-7 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: '#2563eb', display: 'inline-block' }}>
              Learn More
            </a>
          </div>

          {/* Marquee strip */}
          <div className="relative z-10 pb-12">
            <div className="absolute left-0 inset-y-0 w-28 z-10 pointer-events-none"
              style={{ background: 'linear-gradient(to right, #000, transparent)' }} />
            <div className="absolute right-0 inset-y-0 w-28 z-10 pointer-events-none"
              style={{ background: 'linear-gradient(to left, #000, transparent)' }} />
            <div className="flex gap-6 animate-marquee whitespace-nowrap">
              {items.map((tech, i) => (
                <div key={i} className="inline-flex flex-col items-center gap-2.5 flex-shrink-0">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                    style={{ background: tech.bg, boxShadow: `0 4px 20px ${tech.bg}55` }}
                  >
                    {tech.svg}
                  </div>
                  <span className="text-[11px] text-white/40 font-medium">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
