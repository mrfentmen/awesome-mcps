export class CoinmetricsError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "CoinmetricsError"
  }
}

export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}

const UA = { "User-Agent": "awesome-mcps/1.0" }

function envStrict(name: string): string {
  const v = process.env[name]
  if (!v) throw new CoinmetricsError(`Set the ${name} environment variable.`)
  return v
}

async function authHeaders(): Promise<Record<string, string>> {
  return {};
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
    throw new CoinmetricsError(`HTTP ${res.status}: ${detail}`)
  }
  return data
}

export async function getAssetMetrics(assets: string, metrics: string, startTime: string, endTime: string, frequency?: string): Promise<string> {
  let url = `https://community-api.coinmetrics.io/v4/timeseries/asset-metrics`;
  const qs = new URLSearchParams();
  qs.append("assets", String(assets));
  qs.append("metrics", String(metrics));
  if (frequency !== undefined) qs.append("frequency", String(frequency));
  qs.append("start_time", String(startTime));
  qs.append("end_time", String(endTime));
  const qstr = qs.toString();
  if (qstr) url += (url.includes('?') ? '&' : '?') + qstr;
  const data = await req(url);
  return pretty(data);
}

export async function listMetrics(assets: string): Promise<string> {
  let url = `https://community-api.coinmetrics.io/v4/catalog-all/asset-metrics`;
  const qs = new URLSearchParams();
  qs.append("assets", String(assets));
  const qstr = qs.toString();
  if (qstr) url += (url.includes('?') ? '&' : '?') + qstr;
  const data = await req(url);
  return pretty(data);
}
