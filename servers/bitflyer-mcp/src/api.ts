const BASE = 'https://api.bitflyer.com/v1';
const UA = 'mrfentmen-bitflyer-mcp/1.0 (https://github.com/mrfentmen)';
export class BitflyerError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' }, signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new BitflyerError(`BitFlyer returned ${res.status}`);
  return (await res.json()) as T;
}

export async function ticker(args: { product?: string }): Promise<string> {
  const product = (args.product ?? 'BTC_JPY').toUpperCase();
  const d = await get<{ product_code?: string; state?: string; timestamp?: string; tick_id?: number; best_bid?: number; best_ask?: number; best_bid_size?: number; best_ask_size?: number; total_bid_depth?: number; total_ask_depth?: number; ltp?: number; volume?: number }>(`${BASE}/ticker?product_code=${encodeURIComponent(product)}`);
  return [
    `${d.product_code ?? product}: ${d.ltp ?? '?'} JPY`,
    `Best bid: ${d.best_bid ?? '?'} (${d.best_bid_size ?? '?'}) | Best ask: ${d.best_ask ?? '?'} (${d.best_ask_size ?? '?'})`,
    `Volume: ${d.volume ?? '?'} | State: ${d.state ?? '?'}`,
    `Time: ${d.timestamp ?? '?'}`,
  ].join('\n');
}

export async function board(args: { product?: string; depth?: number }): Promise<string> {
  const product = (args.product ?? 'BTC_JPY').toUpperCase();
  const depth = Math.max(1, Math.min(args.depth ?? 5, 20));
  const d = await get<{ bids?: Array<{ price?: number; size?: number }>; asks?: Array<{ price?: number; size?: number }> }>(`${BASE}/board?product_code=${encodeURIComponent(product)}`);
  const bids = (d.bids ?? []).slice(0, depth);
  const asks = (d.asks ?? []).slice(0, depth);
  const fmt = (side: string, rows: Array<{ price?: number; size?: number }>) => rows.map((r) => `${side} ${r.price ?? '?'} @ ${r.size ?? '?'}`).join('\n');
  return `Order book ${product} (top ${depth}):\n${fmt('ASK', asks)}\n---\n${fmt('BID', bids)}`;
}

export async function markets(_args: Record<string, never> = {}): Promise<string> {
  const d = await get<Array<{ product_code?: string; market_type?: string }>>(`${BASE}/markets`);
  const rows = (d ?? []).filter((m) => m.market_type === 'Spot').slice(0, 30);
  return `BitFlyer spot markets (${rows.length} shown):\n${rows.map((m, i) => `${i + 1}. ${m.product_code ?? '?'}`).join('\n')}`;
}
