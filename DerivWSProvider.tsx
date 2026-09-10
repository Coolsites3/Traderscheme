'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { DerivWSClient } from '@/lib/deriv/client';
import { DerivWSContext, DerivWSState } from '@/lib/hooks/useDerivWS';
import { getStoredToken, clearSession } from '@/lib/deriv/session';
import { subscribeBalance } from '@/lib/deriv/account';

export function DerivWSProvider({ children }: { children: React.ReactNode }) {
  const clientRef = useRef<DerivWSClient | null>(null);
  const [state, setState] = useState<Omit<DerivWSState, 'client'>>({
    isConnected: false,
    connecting: true,
    error: null,
    balance: null,
    loginid: null,
    currency: 'USD',
  });

  useEffect(() => {
    let cancelled = false;
    const token = getStoredToken();
    if (!token) {
      setState((s) => ({ ...s, connecting: false, error: 'No Deriv session token' }));
      return;
    }

    const appId = process.env.NEXT_PUBLIC_DERIV_APP_ID || '1089';
    const endpoint = process.env.NEXT_PUBLIC_DERIV_API_URL || 'wss://ws.binaryws.com/websockets/v3';
    const client = new DerivWSClient(appId, endpoint);
    clientRef.current = client;

    (async () => {
      try {
        const auth = await client.connect(token);
        if (cancelled) return;
        const info = auth.authorize || {};
        setState((s) => ({
          ...s,
          isConnected: true,
          connecting: false,
          error: null,
          loginid: info.loginid || null,
          balance: typeof info.balance === 'number' ? info.balance : null,
          currency: info.currency || 'USD',
        }));
        await subscribeBalance(client, (balance, currency) => {
          if (cancelled) return;
          setState((s) => ({ ...s, balance, currency }));
        });
      } catch (err: any) {
        if (cancelled) return;
        clearSession();
        setState((s) => ({
          ...s,
          isConnected: false,
          connecting: false,
          error: err?.message || 'Failed to authorize with Deriv',
        }));
      }
    })();

    return () => {
      cancelled = true;
      client.disconnect();
      clientRef.current = null;
    };
  }, []);

  const value = useMemo<DerivWSState>(
    () => ({ ...state, client: clientRef.current }),
    [state]
  );

  return <DerivWSContext.Provider value={value}>{children}</DerivWSContext.Provider>;
}
