export class EcccError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "EcccError"
  }
}

export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}

const UA = { "User-Agent": "awesome-mcps/1.0" }
const BASE = "https://api.weather.gc.ca"

function envStrict(name: string): string {
  const v = process.env[name]
  if (!v) throw new EcccError(`Set the ${name} environment variable.`)
  return v
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
    throw new EcccError(`HTTP ${res.status}: ${detail}`)
  }
  return data
}

export async function listCollections(): Promise<string> {
  let url = BASE + `/collections`;
  const data = await req(url);
  return pretty(data);
}

export async function getCollection(collectionId: string): Promise<string> {
  let url = BASE + `/collections/${encodeURIComponent(String(collectionId))}`;
  const data = await req(url);
  return pretty(data);
}

export async function queryCollection(collectionId: string, bbox?: string, limit?: number): Promise<string> {
  let url = BASE + `/collections/${encodeURIComponent(String(collectionId))}/items`;
  const qs = new URLSearchParams();
  const qstr = qs.toString();
  if (qstr) url += (url.includes('?') ? '&' : '?') + qstr;
  const data = await req(url);
  return pretty(data);
}
