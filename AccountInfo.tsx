'use client';

import { useRouter } from 'next/navigation';
import { clearSession } from '@/lib/deriv/session';

export function AccountInfo({
  balance,
  loginid,
  currency = 'USD',
}: {
  balance: number | null;
  loginid: string | null;
  currency?: string;
}) {
  const router = useRouter();

  const logout = async () => {
    clearSession();
    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
    } catch {
      // ignore
    }
    router.replace('/');
  };

  return (
    <div className="bg-gray-900 px-4 py-2 rounded-lg border border-gray-800 flex items-center gap-4 flex-wrap">
      <span className="text-gray-400 text-sm">
        ID: <span className="text-white">{loginid || '—'}</span>
      </span>
      <span className="text-gray-400 text-sm">
        Balance:{' '}
        <span className="text-amber-400 font-bold">
          {currency} {balance?.toFixed(2) || '0.00'}
        </span>
      </span>
      <button onClick={logout} className="text-xs text-gray-500 hover:text-white underline">
        Disconnect
      </button>
    </div>
  );
}
