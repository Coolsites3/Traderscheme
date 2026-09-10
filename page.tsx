'use client';

import { useCallback, useEffect, useState } from 'react';
import { ConnectButton } from '@/components/auth/ConnectButton';
import { BootScreen } from '@/components/ui/BootScreen';
import { persistAccountsFromSearch } from '@/lib/deriv/session';

export default function Home() {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const stored = persistAccountsFromSearch(window.location.search);
    if (stored.length > 0) {
      window.history.replaceState({}, '', '/');
      window.location.href = '/dashboard';
    }
  }, []);

  const finishBoot = useCallback(() => setBooting(false), []);

  return (
    <main className="min-h-screen bg-[#02010a] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {booting && <BootScreen onDone={finishBoot} />}
      <img src="/boot-bg.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 text-center max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-2 tracking-tight">
          TRADER<span className="text-cyan-400">SCHEME</span>
        </h1>
        <p className="text-slate-300 text-xl mb-8">Trading Workspace</p>
        <ConnectButton />
      </div>
    </main>
  );
}
