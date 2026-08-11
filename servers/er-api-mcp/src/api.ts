const UA = 'mrfentmen-er-api-mcp/1.0';
const BASE = 'https://open.er-api.com/v6/latest';

interface RatesResponse {
  result?: string;
  base_code?: string;
  time_last_update_utc?: string;
  rates?: Record<string, number>;
}

export interface BaseArg {
  base?: string;
}
export interface ConvertArgs {
  from: string;
  to: string;
  amount: number;
}

export async function latest(args: BaseArg): Promise<string> {
  const base = String(args?.base ?? 'USD').toUpperCase();
  const res = await fetch(`${BASE}/${encodeURIComponent(base)}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`ER API returned ${res.status}`);
  const d = (await res.json()) as RatesResponse;
  if (d.result !== 'success' || !d.rates) throw new Error(`ER API error: ${d.result ?? 'unknown'}`);
  const rates = d.rates;
  const top = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'CAD', 'AUD', 'CHF', 'INR', 'BRL'].filter((c) => rates[c] != null);
  return `Exchange rates base ${d.base_code ?? base} (updated ${d.time_last_update_utc ?? '?'}):\n` + top.map((c) => `* ${c}: ${rates[c]}`).join('\n');
}

export async function convert(args: ConvertArgs): Promise<string> {
  const from = String(args.from).toUpperCase();
  const to = String(args.to).toUpperCase();
  const amount = Number(args.amount);
  if (!from || !to || !Number.isFinite(amount) || amount <= 0) throw new Error('Provide a valid from, to, and positive amount.');
  const res = await fetch(`${BASE}/${encodeURIComponent(from)}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`ER API returned ${res.status}`);
  const d = (await res.json()) as RatesResponse;
  const rate = d.rates?.[to];
  if (rate == null) throw new Error(`No rate for ${to} (base ${from}).`);
  return `${amount} ${from} = ${(amount * rate).toFixed(2)} ${to} (rate ${rate})`;
}
