const UA = 'mrfentmen-timeapi-mcp/1.0';
const BASE = 'https://timeapi.io/api/Time';

export interface ZoneArgs {
  zone: string;
}
export interface ConvertArgs {
  from: string;
  to: string;
  datetime?: string;
}

export async function current(args: ZoneArgs): Promise<string> {
  const zone = String(args.zone).trim();
  if (!zone) throw new Error('Provide an IANA zone like Europe/London.');
  const res = await fetch(`${BASE}/current/zone?timeZone=${encodeURIComponent(zone)}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`TimeAPI returned ${res.status}`);
  const d = (await res.json()) as { timeZone?: string; dateTime?: string; date?: string; time?: string; dayOfWeek?: number; dstActive?: boolean };
  if (!d.dateTime) throw new Error(`No time for ${zone}.`);
  return `Current time in ${d.timeZone ?? zone}:\n${d.dateTime} (${d.date ?? ''} ${d.time ?? ''})\nDST active: ${d.dstActive ?? '?'} | Day of week: ${d.dayOfWeek ?? '?'}`;
}

export async function convert(args: ConvertArgs): Promise<string> {
  const from = String(args.from).trim(), to = String(args.to).trim();
  if (!from || !to) throw new Error('Provide from and to IANA zones.');
  const dt = args.datetime || new Date().toISOString();
  const url = `${BASE}/convert/zone?fromTimeZone=${encodeURIComponent(from)}&toTimeZone=${encodeURIComponent(to)}&dateTime=${encodeURIComponent(dt)}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`TimeAPI returned ${res.status}`);
  const d = (await res.json()) as { fromTimezone?: string; toTimezone?: string; conversionResult?: string };
  if (!d.conversionResult) throw new Error('No conversion returned.');
  return `${dt} ${d.fromTimezone ?? from} -> ${d.conversionResult} ${d.toTimezone ?? to}`;
}
