const BASE = 'https://api.aladhan.com/v1';

export interface TimingsArgs {
  city: string;
  country: string;
}

export async function timings(args: TimingsArgs): Promise<string> {
  const url = `${BASE}/timingsByCity?city=${encodeURIComponent(args.city)}&country=${encodeURIComponent(args.country)}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'mrfentmen-prayer-times-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`aladhan returned ${res.status}`);
  const json = (await res.json()) as {
    data?: { timings?: Record<string, string>; date?: { gregorian?: { date?: string } } };
  };
  const d = json.data;
  if (!d?.timings) throw new Error('aladhan returned no timings');
  const t = d.timings;
  const lines = [`Prayer times for ${args.city}, ${args.country} (${d.date?.gregorian?.date ?? ''}):`];
  for (const [label, key] of [
    ['Fajr', 'Fajr'],
    ['Sunrise', 'Sunrise'],
    ['Dhuhr', 'Dhuhr'],
    ['Asr', 'Asr'],
    ['Maghrib', 'Maghrib'],
    ['Isha', 'Isha'],
  ] as const) {
    if (t[key]) lines.push(`${label}: ${t[key]}`);
  }
  return lines.join('\n');
}
