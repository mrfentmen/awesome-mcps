const UA = 'mrfentmen-htx-mcp/1.0';
const BASE = 'https://api.huobi.pro';

export interface SymbolArg {
  symbol: string;
}
export interface DepthArgs {
  symbol: string;
  depth?: number;
}

export async function ticker(args: SymbolArg): Promise<string> {
  const symbol = String(args.symbol).trim().toLowerCase();
  if (!symbol) throw new Error('Provide a symbol like btcusdt.');
  const res = await fetch(`${BASE}/market/detail/merged?symbol=${encodeURIComponent(symbol)}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`HTX returned ${res.status}`);
  const d = (await res.json()) as { status?: string; tick?: { close?: number; open?: number; high?: number; low?: number; vol?: number; amount?: number; bid?: number; ask?: number; count?: number } };
  if (d.status !== 'ok' || !d.tick) throw new Error(`No ticker for ${symbol}.`);
  const t = d.tick;
  const change = t.open ? t.close != null ? ((t.close - t.open) / t.open) * 100 : null : null;
  return `HTX ${symbol.toUpperCase()}:\nLast: ${t.close ?? '?'}${change != null ? ` (${change >= 0 ? '+' : ''}${change.toFixed(2)}%)` : ''}\nOpen: ${t.open ?? '?'} | High: ${t.high ?? '?'} | Low: ${t.low ?? '?'}\nBid: ${t.bid ?? '?'} | Ask: ${t.ask ?? '?'}\nVolume: ${t.vol ?? '?'} | Turnover: ${t.amount ?? '?'} | Trades: ${t.count ?? '?'}`;
}

export async function depth(args: DepthArgs): Promise<string> {
  const symbol = String(args.symbol).trim().toLowerCase();
  const depth = Math.min(Math.max(Number(args?.depth ?? 5) || 5, 1), 20);
  const res = await fetch(`${BASE}/market/depth?symbol=${encodeURIComponent(symbol)}&type=step0&depth=${depth}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`HTX returned ${res.status}`);
  const d = (await res.json()) as { status?: string; tick?: { bids?: Array<[number, number]>; asks?: Array<[number, number]> } };
  const bids = d.tick?.bids ?? [], asks = d.tick?.asks ?? [];
  if (d.status !== 'ok') throw new Error(`No depth for ${symbol}.`);
  return `HTX ${symbol.toUpperCase()} order book (top ${depth}):\nBids:\n` + bids.slice(0, depth).map(([p, s]) => `  ${p} @ ${s}`).join('\n') + `\nAsks:\n` + asks.slice(0, depth).map(([p, s]) => `  ${p} @ ${s}`).join('\n');
}
