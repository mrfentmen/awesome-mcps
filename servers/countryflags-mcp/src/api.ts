const BASE = 'https://flagcdn.com';

export interface ListArgs {
  search?: string;
  limit?: number;
}

export interface FlagArgs {
  code: string;
}

export async function list(args: ListArgs = {}): Promise<string> {
  const res = await fetch(`${BASE}/en/codes.json`, {
    headers: { 'User-Agent': 'mrfentmen-countryflags-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Flagcdn returned ${res.status}`);
  const codes = (await res.json()) as Record<string, string>;
  const entries = Object.entries(codes);
  const q = (args.search ?? '').trim().toLowerCase();
  const limit = Math.max(1, Math.min(args.limit ?? 20, 100));
  const filtered = q ? entries.filter(([code, name]) => `${code} ${name}`.toLowerCase().includes(q)) : entries;
  const shown = filtered.slice(0, limit);
  if (!shown.length) return `No countries match "${q}".`;
  return `Country flags (${shown.length} shown):\n` +
    shown.map(([code, name], i) => `${i + 1}. ${name} (${code}) | ${BASE}/${code}.png`).join('\n');
}

export async function flag(args: FlagArgs): Promise<string> {
  const code = (args.code ?? '').trim().toLowerCase();
  if (!code) return 'Provide a country code like us.';
  return `${code.toUpperCase()}: ${BASE}/${code}.png (w160: ${BASE}/w160/${code}.png, w320: ${BASE}/w320/${code}.png)`;
}
