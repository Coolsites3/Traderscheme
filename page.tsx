'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDerivWS } from '@/lib/hooks/useDerivWS';
import { DerivWSProvider } from '@/components/auth/DerivWSProvider';
import { TradingPanel } from '@/components/trading/TradingPanel';
import { MarketSelector } from '@/components/trading/MarketSelector';
import { AccountInfo } from '@/components/dashboard/AccountInfo';
import { OpenContracts } from '@/components/trading/OpenContracts';
import { TickTape } from '@/components/trading/TickTape';
import { persistAccountsFromSearch, getStoredToken } from '@/lib/deriv/session';
import { BootScreen } from '@/components/ui/BootScreen';

export default function DashboardPage() {
  const [booted, setBooted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    persistAccountsFromSearch(window.location.search);
    if (window.location.search.includes('token') || window.location.search.includes('acct')) {
      window.history.replaceState({}, '', '/dashboard');
    }
    if (!getStoredToken()) {
      router.replace('/');
      return;
    }
    setBooted(true);
  }, [router]);

  if (!booted) {
    return <BootScreen subtitle="Preparing workspace" durationMs={1200} />;
  }

  return (
    <DerivWSProvider>
      <Dashboard />
    </DerivWSProvider>
  );
}

function Dashboard() {
  const router = useRouter();
  const { isConnected, connecting, error, balance, loginid, currency } = useDerivWS();
  const [selectedSymbol, setSelectedSymbol] = useState('R_100');

  if (connecting || !isConnected) {
    if (error) {
      return (
        <div className="min-h-screen bg-[#02010a] flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-red-300 mb-3">{error}</p>
            <button onClick={() => router.replace('/')} className="text-cyan-400 text-sm underline">
              Back to connect
            </button>
          </div>
        </div>
      );
    }
    return <BootScreen subtitle="Connecting to Deriv..." durationMs={8000} />;
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">
          TRADER<span className="text-amber-500">SCHEME</span>
        </h1>
        <AccountInfo balance={balance} loginid={loginid} currency={currency} />
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <MarketSelector selectedSymbol={selectedSymbol} onSelect={setSelectedSymbol} />
          <TickTape symbol={selectedSymbol} />
          <OpenContracts />
        </div>
        <div>
          <TradingPanel symbol={selectedSymbol} />
        </div>
      </div>
    </div>
  );
}
