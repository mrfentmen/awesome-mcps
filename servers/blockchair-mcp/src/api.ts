const BASE = 'https://api.blockchair.com';
const UA = 'mrfentmen-blockchair-mcp/1.0';

export interface ChainArgs {
  chain?: string;
}

export async function stats(_args?: unknown): Promise<string> {
  const res = await fetch(`${BASE}/bitcoin/stats`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Blockchair returned ${res.status}`);
  const d = (await res.json()) as { data?: { blocks?: number; transactions?: number; outputs?: number; market_price_usd?: number; mempool_transactions?: number; average_transaction_fee_usd?: number; largest_transaction_24h?: number } };
  const s = d.data ?? {};
  const fmt = (n?: number) => (n != null ? n.toLocaleString() : '?');
  return [
    'Blockchair Bitcoin stats:',
    `Blocks: ${fmt(s.blocks)} | Transactions: ${fmt(s.transactions)}`,
    s.market_price_usd != null ? `Market price: $${s.market_price_usd}` : null,
    s.mempool_transactions != null ? `Mempool: ${fmt(s.mempool_transactions)} txs` : null,
    s.average_transaction_fee_usd != null ? `Avg tx fee: $${s.average_transaction_fee_usd}` : null,
  ].filter(Boolean).join('\n');
}

export async function chain(args: ChainArgs): Promise<string> {
  const chain = (args?.chain ?? 'bitcoin').trim().toLowerCase();
  const res = await fetch(`${BASE}/${encodeURIComponent(chain)}/stats`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Blockchair returned ${res.status}`);
  const d = (await res.json()) as { data?: { blocks?: number; transactions?: number; market_price_usd?: number } };
  const s = d.data ?? {};
  const fmt = (n?: number) => (n != null ? n.toLocaleString() : '?');
  return [
    `Blockchair ${chain} stats:`,
    `Blocks: ${fmt(s.blocks)} | Transactions: ${fmt(s.transactions)}`,
    s.market_price_usd != null ? `Market price: $${s.market_price_usd}` : null,
  ].filter(Boolean).join('\n');
}
