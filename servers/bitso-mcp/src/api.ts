const UA = 'mrfentmen-bitso-mcp/1.0';

export interface TickerArgs {
  book: string;
}

export async function ticker(args: TickerArgs): Promise<string> {
  const book = (args.book ?? '').trim().toLowerCase();
  if (!book) return 'Provide a book like btc_mxn.';
  const res = await fetch(`https://api.bitso.com/v3/ticker/?book=${encodeURIComponent(book)}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Bitso returned ${res.status}`);
  const d = (await res.json()) as { success?: boolean; payload?: { last?: string; high?: string; low?: string; bid?: string; ask?: string; volume?: string; created_at?: string } };
  if (!d.success || !d.payload) throw new Error('Bitso: no ticker data');
  const p = d.payload;
  return [
    `Bitso ${book}:`,
    `Last: ${p.last ?? '?'} MXN | Bid: ${p.bid ?? '?'} | Ask: ${p.ask ?? '?'}`,
    `High: ${p.high ?? '?'} | Low: ${p.low ?? '?'} | Volume: ${p.volume ?? '?'}`,
    `Updated: ${p.created_at ?? '?'}`,
  ].filter(Boolean).join('\n');
}
