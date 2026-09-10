'use client';

import { useState } from 'react';
import { derivOAuthURL } from '@/lib/deriv/auth';
import { persistAccounts } from '@/lib/deriv/session';

export function ConnectButton() {
  const envToken = process.env.NEXT_PUBLIC_DERIV_API_TOKEN || '';
  const [token, setToken] = useState(envToken);
  const [showOauth, setShowOauth] = useState(false);

  const connectWithToken = () => {
    const value = token.trim();
    if (!value) return;
    persistAccounts([{ loginid: '', token: value, currency: 'USD' }]);
    window.location.href = '/dashboard';
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <div className="text-left">
        <label className="block text-gray-400 text-sm mb-2">API token (local / PAT)</label>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste a Deriv API token"
          className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700"
        />
      </div>
      <button
        onClick={connectWithToken}
        disabled={!token.trim()}
        className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-black font-bold py-4 px-8 rounded-lg text-lg transition-all duration-200 shadow-lg shadow-amber-500/20"
      >
        CONNECT WITH TOKEN
      </button>
      <p className="text-xs text-gray-500">
        Deriv does not allow <code className="text-gray-400">http://localhost</code> as an OAuth
        redirect. Use a token locally. For OAuth, register an{' '}
        <span className="text-gray-300">https://your-domain</span> redirect in Application Manager,
        or <code className="text-gray-400">https://localhost:8443</code> if you run HTTPS locally.
      </p>
      <button
        type="button"
        onClick={() => setShowOauth((v) => !v)}
        className="text-xs text-gray-500 underline"
      >
        {showOauth ? 'Hide OAuth' : 'I have an HTTPS redirect — use OAuth'}
      </button>
      {showOauth && (
        <button
          onClick={() => {
            window.location.href = derivOAuthURL();
          }}
          className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg"
        >
          CONNECT VIA DERIV OAUTH
        </button>
      )}
    </div>
  );
}
