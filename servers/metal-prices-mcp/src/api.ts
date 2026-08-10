const BASE = 'https://api.gold-api.com';

const METAL_MAP: Record<string, string> = {
  gold: 'XAU',
  silver: 'XAG',
  platinum: 'XPT',
  palladium: 'XPD',
};

const NAMES: Record<string, string> = {
  XAU: 'Gold',
  XAG: 'Silver',
  XPT: 'Platinum',
  XPD: 'Palladium',
};

export interface PriceArgs {
  metal: string;
}

function resolveCode(input: string): string {
  const v = input.trim().toLowerCase();
  if (v in METAL_MAP) return METAL_MAP[v];
  return v.toUpperCase();
}

async function fetchPrice(code: string): Promise<{ name: string; price: number }> {
  const res = await fetch(`${BASE}/price/${code}`, {
    headers: { 'User-Agent': 'mrfentmen-metal-prices-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`Gold API returned ${res.status}`);
  const data = (await res.json()) as { price?: number; name?: string };
  if (typeof data.price !== 'number') throw new Error(`No price for metal ${code}`);
  return { name: data.name ?? NAMES[code] ?? code, price: data.price };
}

export async function price(args: PriceArgs): Promise<string> {
  if (!args.metal) return 'Provide a metal like gold, silver, platinum, or palladium.';
  const code = resolveCode(args.metal);
  const { name, price: p } = await fetchPrice(code);
  return `${name} (${code}) spot price: $${p.toFixed(2)}`;
}

export async function all(_args: Record<string, never> = {}): Promise<string> {
  const codes = ['XAU', 'XAG', 'XPT', 'XPD'];
  const out: string[] = [];
  for (const code of codes) {
    try {
      const { name, price: p } = await fetchPrice(code);
      out.push(`${name} (${code}): $${p.toFixed(2)}`);
    } catch (e) {
      out.push(`${NAMES[code] ?? code}: unavailable (${e instanceof Error ? e.message : String(e)})`);
    }
  }
  return `Precious metals spot prices (USD):\n` + out.map((l, i) => `${i + 1}. ${l}`).join('\n');
}
