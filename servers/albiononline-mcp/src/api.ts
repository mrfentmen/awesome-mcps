export class AlbiononlineError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "AlbiononlineError"
  }
}

export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}

const UA = { "User-Agent": "awesome-mcps/1.0" }

function pretty(data: unknown): string {
  const t = typeof data === "string" ? data : JSON.stringify(data, null, 2)
  return t.length > 12000 ? t.slice(0, 12000) + "\n…(truncated)" : t
}

function stripHtml(html: string): string {
  return html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
}

async function req(url: string, init: RequestInit = {}): Promise<unknown> {
  const res = await fetch(url, { headers: { ...UA, ...(init.headers ?? {}) }, ...init })
  const ct = res.headers.get("content-type") ?? ""
  const data = ct.includes("json") ? await res.json() : await res.text()
  if (!res.ok) {
    const detail = typeof data === "string" ? data.slice(0, 300) : JSON.stringify(data).slice(0, 300)
    throw new AlbiononlineError(`HTTP ${res.status}: ${detail}`)
  }
  return data
}

export async function getPrices(item: string, locations?: string, qualities?: string): Promise<string> {
  let url = `https://albion-online-data.com/api/v2/stats/prices/${encodeURIComponent(String(item))}`;
  const qs = new URLSearchParams();
  if (locations !== undefined) qs.append("locations", String(locations));
  if (qualities !== undefined) qs.append("qualities", String(qualities));
  const qstr = qs.toString();
  if (qstr) url += (url.includes('?') ? '&' : '?') + qstr;
  const data = await req(url);
  return pretty(data);
}

export async function getPriceHistory(item: string, date?: string, end_date?: string, timeScale?: string): Promise<string> {
  let url = `https://albion-online-data.com/api/v2/stats/history/${encodeURIComponent(String(item))}`;
  const qs = new URLSearchParams();
  if (date !== undefined) qs.append("date", String(date));
  if (end_date !== undefined) qs.append("end_date", String(end_date));
  if (timeScale !== undefined) qs.append("time-scale", String(timeScale));
  const qstr = qs.toString();
  if (qstr) url += (url.includes('?') ? '&' : '?') + qstr;
  const data = await req(url);
  return pretty(data);
}

export async function getPriceCharts(item: string, date?: string, end_date?: string, timeScale?: string): Promise<string> {
  let url = `https://albion-online-data.com/api/v2/stats/charts/${encodeURIComponent(String(item))}`;
  const qs = new URLSearchParams();
  if (date !== undefined) qs.append("date", String(date));
  if (end_date !== undefined) qs.append("end_date", String(end_date));
  if (timeScale !== undefined) qs.append("time-scale", String(timeScale));
  const qstr = qs.toString();
  if (qstr) url += (url.includes('?') ? '&' : '?') + qstr;
  const data = await req(url);
  return pretty(data);
}

export async function getGoldPrices(date?: string, count?: number): Promise<string> {
  let url = `https://albion-online-data.com/api/v2/stats/gold`;
  const qs = new URLSearchParams();
  if (date !== undefined) qs.append("date", String(date));
  if (count !== undefined) qs.append("count", String(count));
  const qstr = qs.toString();
  if (qstr) url += (url.includes('?') ? '&' : '?') + qstr;
  const data = await req(url);
  return pretty(data);
}

export async function getRecentKills(limit?: number, offset?: number): Promise<string> {
  let url = `https://gameinfo.albiononline.com/api/gameinfo/events`;
  const qs = new URLSearchParams();
  if (limit !== undefined) qs.append("limit", String(limit));
  if (offset !== undefined) qs.append("offset", String(offset));
  const qstr = qs.toString();
  if (qstr) url += (url.includes('?') ? '&' : '?') + qstr;
  const data = await req(url);
  return pretty(data);
}

export async function getKillDetails(eventId: number): Promise<string> {
  let url = `https://gameinfo.albiononline.com/api/gameinfo/events/${encodeURIComponent(String(eventId))}`;
  const data = await req(url);
  return pretty(data);
}
