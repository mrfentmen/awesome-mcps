const UA = 'mrfentmen-cdc-data-mcp/1.0';

export interface DatasetArgs {
  dataset_id: string;
  limit?: number;
}

export async function dataset(args: DatasetArgs): Promise<string> {
  const id = String(args.dataset_id).trim();
  if (!/^[a-z0-9-]+$/.test(id)) throw new Error('Invalid dataset id.');
  const limit = Math.min(Math.max(Number(args?.limit ?? 10) || 10, 1), 50);
  const res = await fetch(`https://data.cdc.gov/resource/${encodeURIComponent(id)}.json?$limit=${limit}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`CDC returned ${res.status}`);
  const rows = (await res.json()) as Array<Record<string, unknown>>;
  if (!Array.isArray(rows) || !rows.length) return `No rows for dataset ${id}.`;
  const headers = Object.keys(rows[0]).slice(0, 8);
  const lines = rows.slice(0, limit).map((r, i) => {
    const parts = headers.map((h) => `${h}=${String(r[h] ?? '').slice(0, 40)}`);
    return `${i + 1}. ${parts.join(' | ')}`;
  });
  return `CDC dataset ${id} (${rows.length} rows shown, fields: ${headers.join(', ')}):\n` + lines.join('\n');
}
