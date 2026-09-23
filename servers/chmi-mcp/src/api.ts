export class ChmiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ChmiError"
  }
}

export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}

const UA = { "User-Agent": "awesome-mcps/1.0" }

function envStrict(name: string): string {
  const v = process.env[name]
  if (!v) throw new ChmiError(`Set the ${name} environment variable.`)
  return v
}

async function authHeaders(): Promise<Record<string, string>> {
  return {}
}

function parseApacheIndex(html: string): Array<{ name: string; href: string; modified?: string; size?: string }> {
  const out: Array<{ name: string; href: string; modified?: string; size?: string }> = []
  const re = /<a href="([^"?#][^"]*)">([^<]*)<\/a>\s*(\d{2}-[A-Za-z]{3}-\d{4} \d{2}:\d{2})?\s*([\d.\-KM]+)?/g
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    const href = m[1]
    const name = (m[2] || href).trim()
    if (!href || href.startsWith("?") || href.startsWith(".") || name.toLowerCase().includes("parent directory")) continue
    out.push({ name, href, modified: m[3], size: m[4] === "-" ? undefined : m[4] })
  }
  return out
}

function pretty(data: unknown): string {
  const t = typeof data === "string" ? data : JSON.stringify(data, null, 2)
  return t.length > 12000 ? t.slice(0, 12000) + "\n…(truncated)" : t
}

async function req(url: string, init: RequestInit = {}): Promise<unknown> {
  const res = await fetch(url, { headers: { ...UA, ...(await authHeaders()), ...(init.headers ?? {}) }, ...init })
  const ct = res.headers.get("content-type") ?? ""
  const data = ct.includes("json") ? await res.json() : await res.text()
  if (!res.ok) {
    const detail = typeof data === "string" ? data.slice(0, 300) : JSON.stringify(data).slice(0, 300)
    throw new ChmiError(`HTTP ${res.status}: ${detail}`)
  }
  return data
}

export async function browse(path?: string): Promise<string> {
  let url = `https://opendata.chmi.cz/${encodeURIComponent(String(path))}`;
  const res = await fetch(url, { headers: { ...UA, ...(await authHeaders()) } });
  if (!res.ok) throw new ChmiError(`HTTP ${res.status} fetching ${path}`)
  const html = await res.text();
  const items = parseApacheIndex(html);
  if (items.length === 0) return `No entries listed at "${path}".`;
  return pretty(items);
}

export async function getFile(path: string): Promise<string> {
  let url = `https://opendata.chmi.cz/${encodeURIComponent(String(path))}`;
  const res = await fetch(url, { headers: { ...UA, ...(await authHeaders()) } });
  if (!res.ok) throw new ChmiError(`HTTP ${res.status} fetching ${path}`)
  const ct = res.headers.get('content-type') ?? '';
  if (!/text|json|xml|csv/i.test(ct) && !/\.(txt|csv|json|xml|cap|html?)$/i.test(path)) {
    const buf = new Uint8Array(await res.arrayBuffer());
    return `Binary file (${ct || 'unknown type'}, ${buf.length} bytes) — not shown. Use browse() to find text alternatives.`;
  }
  const txt = await res.text();
  return pretty(txt);
}

export async function getLatestAlert(): Promise<string> {
  let url = `https://opendata.chmi.cz/meteorology/weather/alerts/`;
  const res = await fetch(url, { headers: { ...UA, ...(await authHeaders()) } });
  if (!res.ok) throw new ChmiError(`HTTP ${res.status} listing alerts`)
  const items = parseApacheIndex(await res.text());
  const files = items.filter((i) => !i.href.endsWith("/"));
  for (const d of items.filter((i) => i.href.endsWith("/"))) {
    try {
      const dr = await fetch(new URL(d.href, url).toString(), { headers: { ...UA, ...(await authHeaders()) } });
      if (dr.ok) for (const f of parseApacheIndex(await dr.text())) if (!f.href.endsWith('/') && !f.href.startsWith('.')) files.push({ name: d.href + f.name, href: d.href + f.href });
    } catch { /* skip unreadable subdir */ }
  }
  if (files.length === 0) return 'No warning files right now.';
  const textish = files.filter((f) => /\.(xml|cap|txt|json|csv|html?)$/i.test(f.href));
  const pool = textish.length > 0 ? textish : files;
  const latest = pool[pool.length - 1];
  const f = await fetch(new URL(latest.href, url).toString(), { headers: { ...UA, ...(await authHeaders()) } });
  if (!f.ok) throw new ChmiError(`HTTP ${f.status} fetching ${latest.href}`)
  const ftxt = await f.text();
  if (/^%PDF|^PK|^\x89PNG/.test(ftxt)) return `Latest alert file ${latest.href} is binary — use browse() for text alternatives.`;
  return pretty(ftxt);
}
