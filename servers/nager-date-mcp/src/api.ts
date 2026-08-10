const BASE = 'https://date.nager.at/api/v3/PublicHolidays';

export interface HolidaysArgs {
  country: string;
  year: number;
}

export async function holidays(args: HolidaysArgs): Promise<string> {
  const country = (args.country ?? '').trim().toUpperCase();
  const year = Math.max(2000, Math.min(Math.floor(args.year ?? 0), 2100));
  if (!country || !year) return 'Provide a country code and year.';
  const res = await fetch(`${BASE}/${year}/${encodeURIComponent(country)}`, {
    headers: { 'User-Agent': 'mrfentmen-nager-date-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Nager.Date returned ${res.status}`);
  const d = (await res.json()) as Array<Record<string, unknown>>;
  if (!d.length) return `No holidays for ${country} ${year}.`;
  return `Public holidays ${country} ${year} (${d.length}):\n` +
    d.slice(0, 20).map((r, i) => {
      const s = (k: string) => (r[k] != null ? String(r[k]) : '');
      return `${i + 1}. ${s('date')} | ${s('localName')}${s('name') !== s('localName') ? ` (${s('name')})` : ''}`;
    }).join('\n');
}
