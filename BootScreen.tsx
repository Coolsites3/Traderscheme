'use client';

import { useEffect, useState } from 'react';

const STEPS = [
  'Boot sequence',
  'Loading workspace',
  'Calibrating feeds',
  'Initializing D-Bot...',
  'Ready',
];

export function BootScreen({
  onDone,
  durationMs = 2800,
  subtitle = 'TraderScheme Trading Workspace',
}: {
  onDone?: () => void;
  durationMs?: number;
  subtitle?: string;
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const id = window.setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 2.2);
      setProgress(Math.round(eased * 100));
      if (t >= 1) {
        window.clearInterval(id);
        onDone?.();
      }
    }, 40);
    return () => window.clearInterval(id);
  }, [durationMs, onDone]);

  const label = progress < 95 ? STEPS[Math.min(3, Math.floor(progress / 25))] : STEPS[4];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#02010a] text-white">
      <img
        src="/boot-bg.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="boot-stars opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/40 to-black/75" />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-slate-900/55 backdrop-blur-md shadow-[0_0_40px_rgba(0,200,255,0.15)] px-6 py-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">TraderScheme</h1>
          <p className="text-sm text-slate-300 mt-1">{subtitle}</p>

          <div className="flex items-center justify-center gap-1.5 my-6">
            <span className="boot-dot" />
            <span className="boot-dot boot-dot-delay" />
            <span className="boot-dot boot-dot-delay-2" />
          </div>

          <p className="text-sm text-slate-200 mb-5">Initializing D-Bot...</p>

          <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-teal-300 transition-[width] duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-slate-400">
            <span>{label}</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
