const UA = 'mrfentmen-open-holidays-mcp/1.0';

export async function countries(_args?: unknown): Promise<string> {
  const res = await fetch('https://openholidaysapi.org/Countries?languageIsoCode=EN', {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`Open Holidays returned ${res.status}`);
  const d = (await res.json()) as Array<{ isoCode?: string; name?: Array<{ language?: string; text?: string }> }>;
  if (!Array.isArray(d) || !d.length) return 'No countries returned.';
  const name = (c: { isoCode?: string; name?: Array<{ text?: string }> }) => c.name?.find((n) => n.text)?.text ?? c.isoCode ?? '?';
  return `Open Holidays countries (${d.length}):\n` + d.slice(0, 50).map((c, i) => `${i + 1}. ${name(c)} (${c.isoCode ?? '?'})`).join('\n');
}

export interface HolidaysArgs {
  country: string;
  year: number;
}

export async function holidays(args: HolidaysArgs): Promise<string> {
  const country = (args.country ?? '').trim().toUpperCase();
  const year = Number(args.year);
  if (!country || !Number.isFinite(year)) return 'Provide country (ISO) and year.';
  const url = `https://openholidaysapi.org/PublicHolidays?countryIsoCode=${encodeURIComponent(country)}&languageIsoCode=EN&validFrom=${year}-01-01&validTo=${year}-12-31`;
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`Open Holidays returned ${res.status}`);
  const d = (await res.json()) as Array<{ startDate?: string; endDate?: string; name?: Array<{ text?: string }>; type?: string }>;
  if (!Array.isArray(d) || !d.length) return `No holidays for ${country} in ${year}.`;
  return `Open Holidays for ${country} in ${year} (${d.length}):\n` +
    d.map((h, i) => `${i + 1}. ${h.startDate ?? '?'}${h.endDate && h.endDate !== h.startDate ? ` to ${h.endDate}` : ''}: ${h.name?.find((n) => n.text)?.text ?? '?'} (${h.type ?? '?'})`).join('\n');
}
