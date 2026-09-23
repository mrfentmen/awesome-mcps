export class DplaError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "DplaError"
  }
}

export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}

const UA = { "User-Agent": "awesome-mcps/1.0" }

function envStrict(name: string): string {
  const v = process.env[name]
  if (!v) throw new DplaError(`Set the ${name} environment variable.`)
  return v
}

function apiKey(): string {
  return envStrict("DPLA_API_KEY")
}

async function authHeaders(): Promise<Record<string, string>> {
  return {}
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
    throw new DplaError(`HTTP ${res.status}: ${detail}`)
  }
  return data
}

export async function searchItems(query: string, pageSize?: number): Promise<string> {
  const key = apiKey()
  let url = `https://api.dp.la/v2/items`;
  const qs = new URLSearchParams();
  qs.append("q", String(query));
  if (pageSize !== undefined) qs.append("page_size", String(pageSize));
  qs.append("api_key", key);
  const qstr = qs.toString();
  if (qstr) url += (url.includes('?') ? '&' : '?') + qstr;
  const data = await req(url);
  return pretty(data);
}

export async function getItem(itemId: string): Promise<string> {
  const key = apiKey()
  let url = `https://api.dp.la/v2/items/${encodeURIComponent(String(itemId))}`;
  const qs = new URLSearchParams();
  qs.append("api_key", key);
  const qstr = qs.toString();
  if (qstr) url += (url.includes('?') ? '&' : '?') + qstr;
  const data = await req(url);
  return pretty(data);
}

export async function searchCollections(query: string): Promise<string> {
  const key = apiKey()
  let url = `https://api.dp.la/v2/collections`;
  const qs = new URLSearchParams();
  qs.append("q", String(query));
  qs.append("api_key", key);
  const qstr = qs.toString();
  if (qstr) url += (url.includes('?') ? '&' : '?') + qstr;
  const data = await req(url);
  return pretty(data);
}
