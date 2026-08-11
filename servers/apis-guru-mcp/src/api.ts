const BASE = 'https://api.apis.guru/v2';
const UA = 'mrfentmen-apis-guru-mcp/1.0 (https://github.com/mrfentmen)';
export class ApisGuruError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' }, signal: AbortSignal.timeout(25000) });
  if (!res.ok) throw new ApisGuruError(`APIs.guru returned ${res.status}`);
  return (await res.json()) as T;
}

export async function search(args: { query?: string; limit?: number }): Promise<string> {
  const q = (args.query ?? '').trim().toLowerCase();
  const limit = Math.max(1, Math.min(args.limit ?? 10, 30));
  const list = await get<Record<string, unknown>>(`${BASE}/list.json`);
  const names = Object.keys(list);
  const matched = q ? names.filter((n) => n.toLowerCase().includes(q)) : names;
  if (!matched.length) return `No APIs found${q ? ` for "${q}"` : ''}.`;
  const shown = matched.slice(0, limit).map((name) => {
    const entry = list[name] as { info?: { title?: string; description?: string; version?: string }; preferred?: string; apis?: Record<string, { info?: { version?: string } }> };
    return `${name}\n  ${entry?.info?.title ?? ''}${entry?.preferred ? ` (preferred ${entry.preferred})` : ''}\n  ${(entry?.info?.description ?? '').slice(0, 120)}`;
  });
  return `APIs.guru (${matched.length} total, ${shown.length} shown):\n${shown.join('\n')}`;
}

export async function byName(args: { name?: string }): Promise<string> {
  const name = (args.name ?? '').trim();
  if (!name) throw new ApisGuruError('Provide an API name like "openai.com"');
  const list = await get<Record<string, unknown>>(`${BASE}/list.json`);
  const entry = list[name] as {
    info?: { title?: string; description?: string; version?: string; termsOfService?: string; contact?: { email?: string } };
    preferred?: string;
    versions?: Record<string, { updated?: string; swaggerUrl?: string }>;
  } | undefined;
  if (!entry) throw new ApisGuruError(`API "${name}" not found in the directory`);
  const info = entry.info ?? {};
  return [
    `${info.title ?? name} (v${info.version ?? entry.preferred ?? '?'})`,
    (info.description ?? '').slice(0, 400),
    info.termsOfService ? `Terms: ${info.termsOfService}` : null,
    info.contact?.email ? `Contact: ${info.contact.email}` : null,
    `Preferred version: ${entry.preferred ?? '?'}`,
    entry.versions ? `Versions: ${Object.keys(entry.versions).join(', ')}` : null,
  ].filter(Boolean).join('\n');
}
