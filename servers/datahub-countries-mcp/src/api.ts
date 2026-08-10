const BASE = 'https://datahub.io/core/country-codes/r/country-codes.csv';

export interface ListArgs {
  search?: string;
  limit?: number;
}

interface CountryRow {
  name: string;
  official: string;
  alpha2: string;
  alpha3: string;
  numeric: string;
  region: string;
}

function parseCsv(text: string): CountryRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const nameIdx = header.findIndex((h) => h.includes('common_name') || h === 'name');
  const officialIdx = header.findIndex((h) => h.includes('official_name'));
  const a2Idx = header.findIndex((h) => h === 'iso3166_1_alpha_2');
  const a3Idx = header.findIndex((h) => h === 'iso3166_1_alpha_3');
  const numIdx = header.findIndex((h) => h === 'iso3166_1_numeric');
  const regionIdx = header.findIndex((h) => h.includes('region') || h.includes('continent'));
  const rows: CountryRow[] = [];
  for (const line of lines.slice(1)) {
    // simple split respecting quoted fields
    const fields: string[] = [];
    let cur = '';
    let inQ = false;
    for (const ch of line) {
      if (ch === '"') inQ = !inQ;
      else if (ch === ',' && !inQ) {
        fields.push(cur);
        cur = '';
      } else cur += ch;
    }
    fields.push(cur);
    const pick = (idx: number): string => (idx >= 0 ? fields[idx]?.trim() ?? '' : '');
    const name = pick(nameIdx) || pick(officialIdx);
    if (!name) continue;
    rows.push({
      name,
      official: pick(officialIdx),
      alpha2: pick(a2Idx).toLowerCase(),
      alpha3: pick(a3Idx).toLowerCase(),
      numeric: pick(numIdx),
      region: pick(regionIdx),
    });
  }
  return rows;
}

export async function list(args: ListArgs = {}): Promise<string> {
  const res = await fetch(BASE, {
    headers: { 'User-Agent': 'mrfentmen-datahub-countries-mcp/1.0', Accept: 'text/csv' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`DataHub returned ${res.status}`);
  const rows = parseCsv(await res.text());
  if (!rows.length) return 'No country data available.';
  const q = (args.search ?? '').trim().toLowerCase();
  const limit = Math.max(1, Math.min(args.limit ?? 20, 100));
  const filtered = q
    ? rows.filter((r) => `${r.name} ${r.official} ${r.alpha2} ${r.alpha3}`.toLowerCase().includes(q))
    : rows;
  const shown = filtered.slice(0, limit);
  if (!shown.length) return `No countries match "${q}".`;
  return `Countries (${filtered.length} matched, ${shown.length} shown):\n` +
    shown
      .map((r, i) => `${i + 1}. ${r.name} (${r.alpha2}) ${r.alpha3 ? `| ${r.alpha3.toUpperCase()}` : ''}${r.region ? ` | ${r.region}` : ''}`)
      .join('\n');
}
