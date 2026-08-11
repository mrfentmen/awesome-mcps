const UA = 'mrfentmen-bls-mcp/1.0';

export interface SeriesArgs {
  id: string;
  year?: string;
}

export async function series(args: SeriesArgs): Promise<string> {
  const id = (args.id ?? '').trim().toUpperCase();
  if (!id) return 'Provide a BLS series id like CES0000000001.';
  const start = (args?.year ?? '2023').trim();
  const end = String(Number(start) + 1);
  const res = await fetch('https://api.bls.gov/publicAPI/v2/timeseries/data/', {
    method: 'POST',
    headers: { 'User-Agent': UA, 'Content-Type': 'application/json' },
    body: JSON.stringify({ seriesid: [id], startyear: start, endyear: end }),
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`BLS returned ${res.status}`);
  const d = (await res.json()) as { status?: string; Results?: { series?: Array<{ seriesID?: string; data?: Array<{ year?: string; period?: string; value?: string; periodName?: string }> }> } };
  if (d.status !== 'REQUEST_SUCCEEDED') throw new Error(`BLS: ${String(d.status ?? 'failed')}`);
  const s = d.Results?.series?.[0];
  if (!s) return `No BLS series ${id}.`;
  const rows = (s.data ?? []).slice(0, 12).map((x) => `${x.year ?? '?'}-${x.periodName ?? x.period ?? '?'}: ${x.value ?? '?'}`).join('\n');
  return `BLS series ${s.seriesID ?? id}:\n${rows}`;
}
