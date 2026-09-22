export class EveonlineError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "EveonlineError"
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
    throw new EveonlineError(`HTTP ${res.status}: ${detail}`)
  }
  return data
}

export async function getStatus(datasource?: string): Promise<string> {
  let url = `https://esi.evetech.net/latest/status/`;
  const qs = new URLSearchParams();
  if (datasource !== undefined) qs.append("datasource", String(datasource));
  const qstr = qs.toString();
  if (qstr) url += (url.includes('?') ? '&' : '?') + qstr;
  const data = await req(url);
  return pretty(data);
}

export async function search(query: string, categories: string, strict?: boolean, datasource?: string): Promise<string> {
  let url = `https://esi.evetech.net/latest/search/`;
  const qs = new URLSearchParams();
  qs.append("categories", String(categories));
  qs.append("search", String(query));
  if (strict !== undefined) qs.append("strict", String(strict));
  if (datasource !== undefined) qs.append("datasource", String(datasource));
  const qstr = qs.toString();
  if (qstr) url += (url.includes('?') ? '&' : '?') + qstr;
  const data = await req(url);
  return pretty(data);
}

export async function getCharacter(characterId: number, datasource?: string): Promise<string> {
  let url = `https://esi.evetech.net/latest/characters/${encodeURIComponent(String(characterId))}/`;
  const qs = new URLSearchParams();
  if (datasource !== undefined) qs.append("datasource", String(datasource));
  const qstr = qs.toString();
  if (qstr) url += (url.includes('?') ? '&' : '?') + qstr;
  const data = await req(url);
  return pretty(data);
}

export async function getCorporation(corporationId: number, datasource?: string): Promise<string> {
  let url = `https://esi.evetech.net/latest/corporations/${encodeURIComponent(String(corporationId))}/`;
  const qs = new URLSearchParams();
  if (datasource !== undefined) qs.append("datasource", String(datasource));
  const qstr = qs.toString();
  if (qstr) url += (url.includes('?') ? '&' : '?') + qstr;
  const data = await req(url);
  return pretty(data);
}

export async function getAlliance(allianceId: number, datasource?: string): Promise<string> {
  let url = `https://esi.evetech.net/latest/alliances/${encodeURIComponent(String(allianceId))}/`;
  const qs = new URLSearchParams();
  if (datasource !== undefined) qs.append("datasource", String(datasource));
  const qstr = qs.toString();
  if (qstr) url += (url.includes('?') ? '&' : '?') + qstr;
  const data = await req(url);
  return pretty(data);
}

export async function getMarketPrices(datasource?: string): Promise<string> {
  let url = `https://esi.evetech.net/latest/markets/prices/`;
  const qs = new URLSearchParams();
  if (datasource !== undefined) qs.append("datasource", String(datasource));
  const qstr = qs.toString();
  if (qstr) url += (url.includes('?') ? '&' : '?') + qstr;
  const data = await req(url);
  return pretty(data);
}
