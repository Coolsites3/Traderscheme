'use client';

import { useEffect, useState } from 'react';
import { useDerivWS } from '@/lib/hooks/useDerivWS';

type Tick = { quote: number; epoch: number };

export function TickTape({ symbol }: { symbol: string }) {
  const { client } = useDerivWS();
  const [tick, setTick] = useState<Tick | null>(null);
  const [prev, setPrev] = useState<number | null>(null);

  useEffect(() => {
    if (!client) return;
    setTick(null);
    setPrev(null);
    const unsub = client.subscribeTicks(symbol, (next) => {
      setTick((current) => {
        setPrev(current?.quote ?? null);
        return { quote: Number(next.quote), epoch: Number(next.epoch) };
      });
    });
    return unsub;
  }, [client, symbol]);

  const up = tick && prev !== null ? tick.quote >= prev : true;

  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 min-h-[140px]">
      <p className="text-gray-500 text-sm mb-3">Live ticks — {symbol}</p>
      {tick ? (
        <div>
          <p className={`text-4xl font-mono font-bold ${up ? 'text-green-400' : 'text-red-400'}`}>
            {tick.quote}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {new Date(tick.epoch * 1000).toLocaleTimeString()}
          </p>
        </div>
      ) : (
        <p className="text-gray-600 text-sm">Waiting for ticks…</p>
      )}
    </div>
  );
}
