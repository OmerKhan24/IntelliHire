'use client';

import { motion } from 'framer-motion';

// Fixed pseudo-random durations to avoid SSR hydration mismatch
const DURATIONS = [
  20, 22, 18, 25, 21, 19, 23, 20, 24, 22, 18, 20, 21, 23, 25,
  19, 22, 20, 24, 18, 21, 23, 20, 22, 25, 19, 21, 20, 24, 22,
  18, 23, 20, 25, 19, 21,
];

function FloatingPaths({ position, color }: { position: number; color: string }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    // 21.dev-style bezier paths sweeping diagonally across viewport
    d: [
      `M${-380 - i * 5 * position} ${-189 + i * 33}`,
      `C${-380 - i * 5 * position} ${-189 + i * 33}`,
      `${-312 - i * 5 * position} ${216 - i * 33}`,
      `${152 - i * 5 * position} ${343 - i * 33}`,
      `C${616 - i * 5 * position} ${470 - i * 33}`,
      `${684 - i * 5 * position} ${875 - i * 33}`,
      `${684 - i * 5 * position} ${875 - i * 33}`,
    ].join(' '),
    width: 0.5 + i * 0.025,
    opacity: 0.06 + (i / 36) * 0.16,
  }));

  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 696 316"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {paths.map((path) => (
        <motion.path
          key={path.id}
          d={path.d}
          stroke={color}
          strokeOpacity={path.opacity}
          strokeWidth={path.width}
          initial={{ pathLength: 0.01, opacity: 0 }}
          animate={{
            pathLength: [0.01, 1],
            opacity: [0, path.opacity, path.opacity * 0.8, 0],
          }}
          transition={{
            duration: DURATIONS[path.id] ?? 20,
            repeat: Infinity,
            delay: path.id * 0.45,
            ease: 'linear',
            times: [0, 0.35, 0.7, 1],
          }}
        />
      ))}
    </svg>
  );
}

export function BackgroundPaths({
  className = '',
  variant = 'light',
}: {
  className?: string;
  variant?: 'light' | 'dark';
}) {
  const color = variant === 'dark' ? 'rgba(255,255,255,1)' : 'rgba(99,102,241,1)';

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <FloatingPaths position={1} color={color} />
      <FloatingPaths position={-1} color={color} />
    </div>
  );
}
