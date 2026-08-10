const BASE = 'https://api.frankfurter.app';

export interface ConvertArgs {
  amount: number;
  from?: string;
  to: string;
}

export async function latest(_args: Record<string, never> = {}): Promise<string> {
  const res = await fetch(`${BASE}/latest`, {
    headers: { 'User-Agent': 'mrfentmen-ecb-rates-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Frankfurter returned ${res.status}`);
  const data = (await res.json()) as { date?: string; rates?: Record<string, number> };
  const rates = data.rates ?? {};
  const entries = Object.entries(rates).slice(0, 30);
  if (!entries.length) throw new Error('Frankfurter returned no rates');
  return `ECB reference rates vs EUR (${data.date ?? ''}):\n` + entries.map(([code, rate], i) => `${i + 1}. ${code}: ${rate}`).join('\n');
}

export async function convert(args: ConvertArgs): Promise<string> {
  const amount = Number(args.amount);
  if (!Number.isFinite(amount) || amount < 0) return 'Provide a positive amount.';
  const from = (args.from ?? 'EUR').toUpperCase();
  const to = (args.to ?? '').trim().toUpperCase();
  if (!to) return 'Provide a target currency code.';
  const res = await fetch(`${BASE}/latest?from=${from}&to=${to}`, {
    headers: { 'User-Agent': 'mrfentmen-ecb-rates-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Frankfurter returned ${res.status}`);
  const data = (await res.json()) as { date?: string; rates?: Record<string, number> };
  const rate = data.rates?.[to];
  if (typeof rate !== 'number') return `No rate found for ${from} to ${to}.`;
  const result = amount * rate;
  return `${amount.toLocaleString()} ${from} = ${result.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${to} (rate ${rate}, ${data.date ?? ''})`;
}
