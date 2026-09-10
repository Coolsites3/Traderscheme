'use client';

import { createContext, useContext } from 'react';
import { DerivWSClient } from '@/lib/deriv/client';

export type DerivWSState = {
  client: DerivWSClient | null;
  isConnected: boolean;
  connecting: boolean;
  error: string | null;
  balance: number | null;
  loginid: string | null;
  currency: string;
};

export const DerivWSContext = createContext<DerivWSState>({
  client: null,
  isConnected: false,
  connecting: false,
  error: null,
  balance: null,
  loginid: null,
  currency: 'USD',
});

export function useDerivWS() {
  return useContext(DerivWSContext);
}
