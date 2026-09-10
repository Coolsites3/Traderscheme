'use client';

import { useEffect, useState } from 'react';
import { useDerivWS } from '@/lib/hooks/useDerivWS';
import { getActiveSymbols, type ActiveSymbol } from '@/lib/deriv/market';

export function MarketSelector({
  selectedSymbol,
  onSelect,
}: {
  selectedSymbol: string;
  onSelect: (s: string) => void;
}) {
  const { client } = useDerivWS();
  const [symbols, setSymbols] = useState<ActiveSymbol[]>([]);

  useEffect(() => {
    if (!client) return;
    getActiveSymbols(client).then(setSymbols).catch(console.error);
  }, [client]);

  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
      <label className="block text-xs text-gray-500 mb-2">Market</label>
      <select
        value={selectedSymbol}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700"
      >
        {symbols.length === 0 && <option value={selectedSymbol}>{selectedSymbol}</option>}
        {symbols.map((sym) => (
          <option key={sym.symbol} value={sym.symbol}>
            {sym.display_name || sym.symbol}
            {sym.market_display_name ? ` — ${sym.market_display_name}` : ''}
          </option>
        ))}
      </select>
    </div>
  );
}
