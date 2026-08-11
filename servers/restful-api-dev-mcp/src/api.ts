const UA = 'mrfentmen-restful-api-dev-mcp/1.0';

export interface ObjectsArgs {
  limit?: number;
}

export interface ObjectArgs {
  id: string;
}

export async function objects(args: ObjectsArgs): Promise<string> {
  const limit = Math.min(Math.max(Number(args?.limit ?? 5) || 5, 1), 20);
  const res = await fetch('https://api.restful-api.dev/objects', {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`restful-api.dev returned ${res.status}`);
  const d = (await res.json()) as Array<{ id?: string; name?: string }>;
  if (!Array.isArray(d) || !d.length) return 'No objects returned.';
  return `restful-api.dev test objects (${d.length}, showing ${Math.min(limit, d.length)}):\n` +
    d.slice(0, limit).map((x, i) => `${i + 1}. ${x.name ?? '?'} (id=${x.id ?? '?'})`).join('\n');
}

export async function object(args: ObjectArgs): Promise<string> {
  const id = (args.id ?? '').trim();
  if (!id) return 'Provide an object id.';
  const res = await fetch(`https://api.restful-api.dev/objects/${encodeURIComponent(id)}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`restful-api.dev returned ${res.status}`);
  const d = (await res.json()) as Record<string, unknown>;
  const name = d.name ?? '?';
  const data = d.data ? JSON.stringify(d.data) : 'none';
  return `restful-api.dev object ${id}:\nName: ${String(name)}\nData: ${String(data)}`;
}
