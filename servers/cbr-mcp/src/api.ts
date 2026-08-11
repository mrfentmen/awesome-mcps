const UA = 'mrfentmen-cbr-mcp/1.0';

export async function rates(_args?: unknown): Promise<string> {
  const res = await fetch('https://www.cbr-xml-daily.ru/daily_json.js', {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`CBR returned ${res.status}`);
  const d = (await res.json()) as { Date?: string; Valute?: Record<string, { CharCode?: string; Name?: string; Value?: number; Nominal?: number }> };
  const v = d.Valute ?? {};
  const rows = Object.values(v).map((c) => `${c.CharCode ?? '?'}: ${c.Value ?? '?'} RUB per ${c.Nominal ?? 1} (${c.Name ?? '?'})`);
  return `CBR daily rates for ${d.Date ?? 'today'}:\n${rows.join('\n')}`;
}
