const UA = 'mrfentmen-enrico-mcp/1.0';
const BASE = 'https://kayaposoft.com/enrico/json/v2.0';

export interface CountryYearArgs {
  country: string;
  year: number;
}

export async function countries(): Promise<string> {
  const res = await fetch(`${BASE}/?action=getSupportedCountries`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`Enrico returned ${res.status}`);
  const d = (await res.json()) as Array<{ countryCode?: string; fullName?: string; holidayTypes?: string[] }>;
  if (!Array.isArray(d) || !d.length) return 'No countries returned.';
  return `Enrico supported countries (${d.length}):\n` + d.slice(0, 30).map((c) => `* ${c.countryCode ?? '?'} - ${c.fullName ?? '?'}`).join('\n');
}

export async function holidays(args: CountryYearArgs): Promise<string> {
  const country = String(args.country).trim();
  const year = Math.min(Math.max(Number(args.year) || 2026, 2000), 2100);
  const res = await fetch(`${BASE}/?action=getHolidaysForYear&year=${year}&country=${encodeURIComponent(country)}&holidayType=public_holiday`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`Enrico returned ${res.status}`);
  const d = (await res.json()) as Array<{ date?: { day?: number; month?: number; year?: number }; name?: Array<{ text?: string }>; holidayType?: string }>;
  if (!Array.isArray(d) || !d.length) return `No holidays for ${country} in ${year}.`;
  return `Public holidays for ${country.toUpperCase()} ${year} (${d.length}):\n` + d.slice(0, 25).map((h) => {
    const date = h.date ? `${h.date.year}-${String(h.date.month).padStart(2, '0')}-${String(h.date.day).padStart(2, '0')}` : '?';
    return `* ${date}: ${h.name?.[0]?.text ?? '?'}`;
  }).join('\n');
}
