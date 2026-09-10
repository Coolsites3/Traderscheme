import { DerivWSClient } from './client';

export type ActiveSymbol = {
  symbol: string;
  display_name: string;
  market: string;
  market_display_name: string;
  pip?: number;
  is_trading_suspended?: number;
};

export async function getActiveSymbols(client: DerivWSClient): Promise<ActiveSymbol[]> {
  const response = await client.send({
    active_symbols: 'brief',
    product_type: 'basic',
  });
  const list: ActiveSymbol[] = response.active_symbols || [];
  return list
    .filter((s) => !s.is_trading_suspended)
    .sort((a, b) => (a.display_name || a.symbol).localeCompare(b.display_name || b.symbol));
}
