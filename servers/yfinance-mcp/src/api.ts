const UA = 'mrfentmen-yfinance-mcp/1.0';

export interface QuoteArgs {
  symbol: string;
  range?: string;
}
export interface SearchArgs {
  query: string;
}

export async function quote(args: QuoteArgs): Promise<string> {
  const symbol = String(args.symbol).trim().toUpperCase();
  const range = String(args?.range ?? '5d').trim();
  const allowed = new Set(['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'ytd', 'max']);
  if (!allowed.has(range)) throw new Error(`Invalid range ${range}. Use ${[...allowed].join(', ')}.`);
  const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=1d`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`Yahoo Finance returned ${res.status}`);
  const d = (await res.json()) as { chart?: { result?: Array<{ meta?: { currency?: string; symbol?: string; regularMarketPrice?: number; previousClose?: number; fiftyTwoWeekHigh?: number; fiftyTwoWeekLow?: number; longName?: string; marketTime?: number }; timestamp?: number[]; indicators?: { quote?: Array<{ open?: (number | null)[]; high?: (number | null)[]; low?: (number | null)[]; close?: (number | null)[] }> } }> } };
  const r = d.chart?.result?.[0];
  if (!r?.meta?.symbol) throw new Error(`No quote for ${symbol}.`);
  const quote = r.indicators?.quote?.[0];
  const closes = quote?.close ?? [];
  const lastClose = [...closes].reverse().find((c): c is number => c != null);
  const prev = r.meta.previousClose;
  const change = lastClose != null && prev != null ? lastClose - prev : null;
  const pct = change != null && prev ? (change / prev) * 100 : null;
  return `${r.meta.longName ?? r.meta.symbol} (${r.meta.symbol})\nCurrency: ${r.meta.currency ?? '?'} | Range: ${range}\nPrice: ${r.meta.regularMarketPrice ?? lastClose ?? '?'}${change != null && pct != null ? ` (${change >= 0 ? '+' : ''}${change.toFixed(2)} / ${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%)` : ''}\nPrevious close: ${prev ?? '?'}\n52w range: ${r.meta.fiftyTwoWeekLow ?? '?'} - ${r.meta.fiftyTwoWeekHigh ?? '?'}\nLast trade: ${r.meta.marketTime ? new Date(r.meta.marketTime * 1000).toISOString() : '?'}`;
}

export async function search(args: SearchArgs): Promise<string> {
  const res = await fetch(`https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(args.query)}&quotesCount=8&newsCount=0`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`Yahoo Finance returned ${res.status}`);
  const d = (await res.json()) as { quotes?: Array<{ symbol?: string; shortname?: string; exchange?: string; quoteType?: string }> };
  const quotes = d.quotes ?? [];
  if (!quotes.length) return `No symbols matching "${args.query}".`;
  return `Symbols matching "${args.query}":\n` + quotes.slice(0, 8).map((q, i) => `${i + 1}. ${q.symbol ?? '?'} - ${q.shortname ?? '?'} (${q.exchange ?? '?'}, ${q.quoteType ?? '?'})`).join('\n');
}
