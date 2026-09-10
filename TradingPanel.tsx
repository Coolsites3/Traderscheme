'use client';

import { useState } from 'react';
import { useDerivWS } from '@/lib/hooks/useDerivWS';
import { getProposal, executeTrade } from '@/lib/deriv/trading';

export function TradingPanel({ symbol }: { symbol: string }) {
  const { client, isConnected, balance, currency } = useDerivWS();
  const [contractType, setContractType] = useState<'CALL' | 'PUT'>('CALL');
  const [duration, setDuration] = useState(5);
  const [durationUnit, setDurationUnit] = useState<'t' | 's' | 'm' | 'h'>('t');
  const [stake, setStake] = useState(10);
  const [proposal, setProposal] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProposal = async () => {
    if (!client || !isConnected) {
      setError('Not connected');
      return;
    }
    setLoading(true);
    setError(null);
    setProposal(null);
    try {
      const result = await getProposal(client, {
        symbol,
        contract_type: contractType,
        amount: stake,
        duration,
        duration_unit: durationUnit,
        currency: currency || 'USD',
      });
      setProposal(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async () => {
    if (!client || !proposal) return;
    setLoading(true);
    setError(null);
    try {
      const result = await executeTrade(client, proposal.id, proposal.ask_price);
      alert(
        `Trade executed\nContract ID: ${result.contract_id}\nBuy price: ${result.buy_price.toFixed(2)}\nPayout: ${result.payout.toFixed(2)}`
      );
      setProposal(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <h3 className="text-lg font-bold text-white mb-4">TRADING PANEL</h3>
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setContractType('CALL')}
            className={`flex-1 py-2 rounded font-bold ${
              contractType === 'CALL' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'
            }`}
          >
            CALL / HIGHER
          </button>
          <button
            onClick={() => setContractType('PUT')}
            className={`flex-1 py-2 rounded font-bold ${
              contractType === 'PUT' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'
            }`}
          >
            PUT / LOWER
          </button>
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="flex-1 bg-gray-800 text-white px-3 py-2 rounded border border-gray-700"
            min={1}
          />
          <select
            value={durationUnit}
            onChange={(e) => setDurationUnit(e.target.value as 't' | 's' | 'm' | 'h')}
            className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-700"
          >
            <option value="t">Ticks</option>
            <option value="s">Seconds</option>
            <option value="m">Minutes</option>
            <option value="h">Hours</option>
          </select>
        </div>
        <div>
          <label className="text-gray-400 text-sm">Stake ({currency || 'USD'})</label>
          <input
            type="number"
            value={stake}
            onChange={(e) => setStake(Number(e.target.value))}
            className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-700"
            min={0.35}
            step={0.01}
          />
        </div>
        <div className="text-gray-400 text-sm">
          Balance:{' '}
          <span className="text-white font-bold">
            {currency} {balance?.toFixed(2) || '0.00'}
          </span>
        </div>
        <button
          onClick={handleProposal}
          disabled={loading || !isConnected}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'GET QUOTE'}
        </button>
        {proposal && (
          <div className="bg-gray-800 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Payout (with markup):</span>
              <span className="text-amber-400 font-bold">${proposal.adjusted_payout.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Original: ${proposal.original_payout.toFixed(2)}</span>
              <span>
                Markup: {proposal.markup_percent}% (${proposal.markup_amount.toFixed(2)})
              </span>
            </div>
            <p className="text-[11px] text-gray-500 leading-snug">{proposal.longcode}</p>
            <button
              onClick={handleBuy}
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-2 rounded disabled:opacity-50"
            >
              BUY CONTRACT
            </button>
          </div>
        )}
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded text-sm">
            {error}
          </div>
        )}
        <div className="flex items-center gap-2 text-xs">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-gray-500">{isConnected ? 'CONNECTED' : 'DISCONNECTED'}</span>
        </div>
      </div>
    </div>
  );
}
