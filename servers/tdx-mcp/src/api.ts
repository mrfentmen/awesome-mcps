export class TdxError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "TdxError"
  }
}

export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}

const UA = { "User-Agent": "awesome-mcps/1.0" }
const BASE = "https://tdx.transportdata.tw"

function envStrict(name: string): string {
  const v = process.env[name]
  if (!v) throw new TdxError(`Set the ${name} environment variable.`)
  return v
}

let cachedToken = ""
let tokenExpiresAt = 0
async function tdxToken(): Promise<string> {
  const now = Date.now()
  if (!cachedToken || now >= tokenExpiresAt) {
    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: envStrict("TDX_CLIENT_ID"),
      client_secret: envStrict("TDX_CLIENT_SECRET"),
    })
    const res = await fetch("https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token", {
      method: "POST",
      headers: { ...UA, "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    })
    if (!res.ok) throw new TdxError(`TDX login failed: HTTP ${res.status}`)
    const data = (await res.json()) as { access_token?: string; expires_in?: number }
    if (!data.access_token) throw new TdxError("TDX login returned no access token")
    cachedToken = data.access_token
    tokenExpiresAt = now + (data.expires_in ?? 86400) * 1000 - 60000
  }
  return cachedToken
}
async function authHeaders(): Promise<Record<string, string>> {
  return { Authorization: "Bearer " + (await tdxToken()) }
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
    throw new TdxError(`HTTP ${res.status}: ${detail}`)
  }
  return data
}

export async function listTraStations(): Promise<string> {
  let url = BASE + `/api/basic/v2/Rail/TRA/Station`;
  const qs = new URLSearchParams();
  qs.append("$format", "JSON");
  const qstr = qs.toString();
  if (qstr) url += (url.includes('?') ? '&' : '?') + qstr;
  const data = await req(url);
  return pretty(data);
}

export async function getTraLiveboard(stationId: string): Promise<string> {
  let url = BASE + `/api/basic/v2/Rail/TRA/LiveBoard/Station/${encodeURIComponent(String(stationId))}`;
  const qs = new URLSearchParams();
  qs.append("$format", "JSON");
  const qstr = qs.toString();
  if (qstr) url += (url.includes('?') ? '&' : '?') + qstr;
  const data = await req(url);
  return pretty(data);
}

export async function listThsrStations(): Promise<string> {
  let url = BASE + `/api/basic/v2/Rail/THSR/Station`;
  const qs = new URLSearchParams();
  qs.append("$format", "JSON");
  const qstr = qs.toString();
  if (qstr) url += (url.includes('?') ? '&' : '?') + qstr;
  const data = await req(url);
  return pretty(data);
}

export async function getTraTimetable(stationId: string, date: string): Promise<string> {
  let url = BASE + `/api/basic/v2/Rail/TRA/DailyTimetable/Station/${encodeURIComponent(String(stationId))}/${encodeURIComponent(String(date))}`;
  const qs = new URLSearchParams();
  qs.append("$format", "JSON");
  const qstr = qs.toString();
  if (qstr) url += (url.includes('?') ? '&' : '?') + qstr;
  const data = await req(url);
  return pretty(data);
}
