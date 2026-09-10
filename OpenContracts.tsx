'use client';

import { useEffect, useState } from 'react';
import { useDerivWS } from '@/lib/hooks/useDerivWS';
import { getOpenContracts } from '@/lib/deriv/account';

export function OpenContracts() {
  const { client, isConnected } = useDerivWS();
  const [contracts, setContracts] = useState<any[]>([]);

  useEffect(() => {
    if (!client || !isConnected) return;
    const fetchContracts = async () => {
      try {
        const data = await getOpenContracts(client);
        setContracts(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchContracts();
    const interval = setInterval(fetchContracts, 5000);
    return () => clearInterval(interval);
  }, [client, isConnected]);

  if (contracts.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 text-gray-500 text-sm">
        No open contracts
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
      <h3 className="text-white font-bold mb-3">OPEN TRADES</h3>
      <div className="space-y-2">
        {contracts.map((c) => (
          <div key={c.contract_id} className="bg-gray-800 p-3 rounded-lg text-sm flex justify-between gap-2">
            <span className="text-gray-400">{c.symbol}</span>
            <span className="text-white">#{c.contract_id}</span>
            <span className="text-amber-400">${Number(c.buy_price).toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
