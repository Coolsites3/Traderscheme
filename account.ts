import { DerivWSClient } from './client';

export async function subscribeBalance(
  client: DerivWSClient,
  onBalance: (balance: number, currency: string) => void
) {
  const first = await client.send({ balance: 1, subscribe: 1 });
  if (first.balance) {
    onBalance(Number(first.balance.balance), first.balance.currency);
  }
  return client.on('balance', (data) => {
    if (data.balance) {
      onBalance(Number(data.balance.balance), data.balance.currency);
    }
  });
}

export async function getOpenContracts(client: DerivWSClient) {
  const response = await client.send({ portfolio: 1 });
  const contracts = response.portfolio?.contracts || [];
  return contracts.map((c: any) => ({
    contract_id: c.contract_id,
    symbol: c.symbol,
    contract_type: c.contract_type,
    buy_price: Number(c.buy_price ?? 0),
    payout: Number(c.payout ?? 0),
    date_start: c.date_start,
    expiry_time: c.expiry_time,
  }));
}
