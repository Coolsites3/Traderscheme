import { DerivWSClient } from './client';

export type ProposalParams = {
  symbol: string;
  contract_type: 'CALL' | 'PUT';
  amount: number;
  duration: number;
  duration_unit: 't' | 's' | 'm' | 'h' | 'd';
  currency: string;
  barrier?: string;
};

export function markupPercent(): number {
  return parseFloat(process.env.NEXT_PUBLIC_DERIV_MARKUP_PERCENT || '3');
}

export async function getProposal(client: DerivWSClient, params: ProposalParams) {
  const markup = markupPercent() / 100;
  const request: Record<string, unknown> = {
    proposal: 1,
    amount: params.amount,
    basis: 'stake',
    contract_type: params.contract_type,
    currency: params.currency,
    duration: params.duration,
    duration_unit: params.duration_unit,
    symbol: params.symbol,
  };
  if (params.barrier) request.barrier = params.barrier;

  const response = await client.send(request);
  const proposal = response.proposal;
  if (!proposal) throw new Error('No proposal returned');

  const originalPayout = Number(proposal.payout ?? 0);
  const askPrice = Number(proposal.ask_price ?? params.amount);
  const markupAmount = originalPayout * markup;
  const adjustedPayout = Math.max(0, originalPayout - markupAmount);

  return {
    ...proposal,
    id: proposal.id,
    ask_price: askPrice,
    original_payout: originalPayout,
    markup_percent: markup * 100,
    markup_amount: markupAmount,
    adjusted_payout: adjustedPayout,
    spot: proposal.spot,
    longcode: proposal.longcode,
  };
}

export async function executeTrade(client: DerivWSClient, proposalId: string, maxPrice: number) {
  const response = await client.send({
    buy: proposalId,
    price: maxPrice,
  });
  const buy = response.buy;
  if (!buy) throw new Error('Buy did not return a contract');
  return {
    contract_id: buy.contract_id,
    buy_price: Number(buy.buy_price ?? 0),
    payout: Number(buy.payout ?? 0),
    balance_after: Number(buy.balance_after ?? 0),
    transaction_id: buy.transaction_id,
    longcode: buy.longcode,
  };
}
