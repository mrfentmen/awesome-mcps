const BASE = 'https://disease.sh/v3/covid-19';

export interface CountryArgs {
  name: string;
}

export async function country(args: CountryArgs): Promise<string> {
  const name = (args.name ?? '').trim();
  if (!name) return 'Provide a country name or code.';
  const res = await fetch(`${BASE}/countries/${encodeURIComponent(name)}`, {
    headers: { 'User-Agent': 'mrfentmen-covid-data-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`disease.sh returned ${res.status}`);
  const d = (await res.json()) as Record<string, unknown>;
  if (!d.country) return `No COVID data found for "${name}".`;
  return [
    `Country: ${d.country}`,
    `Cases: ${Number(d.cases ?? 0).toLocaleString()}`,
    `Deaths: ${Number(d.deaths ?? 0).toLocaleString()}`,
    `Recovered: ${Number(d.recovered ?? 0).toLocaleString()}`,
    `Active: ${Number(d.active ?? 0).toLocaleString()}`,
    `Cases today: ${Number(d.todayCases ?? 0).toLocaleString()}`,
    `Deaths today: ${Number(d.todayDeaths ?? 0).toLocaleString()}`,
    `Tests: ${Number(d.tests ?? 0).toLocaleString()}`,
    `Population: ${Number(d.population ?? 0).toLocaleString()}`,
    `Updated: ${d.updated ? new Date(Number(d.updated)).toISOString().slice(0, 10) : 'n/a'}`,
  ].join('\n');
}

export async function global(_args: Record<string, never> = {}): Promise<string> {
  const res = await fetch(`${BASE}/all`, {
    headers: { 'User-Agent': 'mrfentmen-covid-data-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`disease.sh returned ${res.status}`);
  const d = (await res.json()) as Record<string, unknown>;
  return [
    `Global COVID totals:`,
    `Cases: ${Number(d.cases ?? 0).toLocaleString()}`,
    `Deaths: ${Number(d.deaths ?? 0).toLocaleString()}`,
    `Recovered: ${Number(d.recovered ?? 0).toLocaleString()}`,
    `Active: ${Number(d.active ?? 0).toLocaleString()}`,
    `Cases today: ${Number(d.todayCases ?? 0).toLocaleString()}`,
    `Deaths today: ${Number(d.todayDeaths ?? 0).toLocaleString()}`,
    `Population: ${Number(d.population ?? 0).toLocaleString()}`,
  ].join('\n');
}
