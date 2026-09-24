export class FingridError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "FingridError"
  }
}

export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}

const UA = { "User-Agent": "awesome-mcps/1.0" }

function envStrict(name: string): string {
  const v = process.env[name]
  if (!v) throw new FingridError(`Set the ${name} environment variable.`)
  return v
}

async function authHeaders(): Promise<Record<string, string>> {
  return { "x-api-key": envStrict("FINGRID_API_KEY") };
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
    throw new FingridError(`HTTP ${res.status}: ${detail}`)
  }
  return data
}

export async function listDatasets(): Promise<string> {
  let url = `https://data.fingrid.fi/api/datasets`;
  const data = await req(url);
  return pretty(data);
}

export async function getRecords(datasetId: string, startTime?: string, endTime?: string): Promise<string> {
  let url = `https://data.fingrid.fi/api/datasets/${encodeURIComponent(String(datasetId))}/data`;
  const qs = new URLSearchParams();
  if (startTime !== undefined) qs.append("startTime", String(startTime));
  if (endTime !== undefined) qs.append("endTime", String(endTime));
  const qstr = qs.toString();
  if (qstr) url += (url.includes('?') ? '&' : '?') + qstr;
  const data = await req(url);
  return pretty(data);
}
