const NAGER_BASE = 'https://date.nager.at/api/v3';
const OPEN_BASE = 'https://openholidaysapi.org';
const UA = 'mrfentmen-holidays-mcp/1.0 (https://github.com/mrfentmen)';
export class HolidaysError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' }, signal: AbortSignal.timeout(25000) });
  if (!res.ok) throw new HolidaysError(`Holidays API error ${res.status}`);
  return (await res.json()) as T;
}

export async function publicHolidays(args: { year?: number; country?: string }): Promise<string> {
  const year = args.year ?? new Date().getFullYear();
  const country = (args.country ?? 'US').toUpperCase();
  const rows = await get<any[]>(`${NAGER_BASE}/PublicHolidays/${year}/${country}`);
  return rows.map((h: any) =>
    `${h.date ?? ''} | ${h.localName ?? h.name ?? ''}${h.global ? ' (nationwide)' : ''}`
  ).join('\n') || 'No holidays found';
}

export async function nextHolidays(args: { country?: string; limit?: number }): Promise<string> {
  const country = (args.country ?? 'US').toUpperCase();
  const limit = Math.min(args.limit ?? 8, 20);
  const rows = await get<any[]>(`${NAGER_BASE}/NextPublicHolidays/${country}`);
  return rows.slice(0, limit).map((h: any) =>
    `${h.date ?? ''} | ${h.localName ?? h.name ?? ''}`
  ).join('\n') || 'No upcoming holidays found';
}

export async function countries(_args: Record<string, never> = {}): Promise<string> {
  const d = await get<Array<{ isoCode?: string; name?: Array<{ language?: string; text?: string }> }>>(`${OPEN_BASE}/Countries?languageIsoCode=EN`);
  if (!Array.isArray(d) || !d.length) return 'No countries returned.';
  const name = (c: { isoCode?: string; name?: Array<{ text?: string }> }) => c.name?.find((n) => n.text)?.text ?? c.isoCode ?? '?';
  return `Open Holidays countries (${d.length}):\n` + d.slice(0, 50).map((c, i) => `${i + 1}. ${name(c)} (${c.isoCode ?? '?'})`).join('\n');
}

export async function openHolidays(args: { country?: string; year?: number }): Promise<string> {
  const country = (args.country ?? '').trim().toUpperCase();
  const year = Number(args.year ?? new Date().getFullYear());
  if (!country || !Number.isFinite(year)) return 'Provide country (ISO) and year.';
  const url = `${OPEN_BASE}/PublicHolidays?countryIsoCode=${encodeURIComponent(country)}&languageIsoCode=EN&validFrom=${year}-01-01&validTo=${year}-12-31`;
  const d = await get<Array<{ startDate?: string; endDate?: string; name?: Array<{ text?: string }>; type?: string }>>(url);
  if (!Array.isArray(d) || !d.length) return `No holidays for ${country} in ${year}.`;
  return `Open Holidays for ${country} in ${year} (${d.length}):\n` +
    d.map((h, i) => `${i + 1}. ${h.startDate ?? '?'}${h.endDate && h.endDate !== h.startDate ? ` to ${h.endDate}` : ''}: ${h.name?.find((n) => n.text)?.text ?? '?'} (${h.type ?? '?'})`).join('\n');
}
