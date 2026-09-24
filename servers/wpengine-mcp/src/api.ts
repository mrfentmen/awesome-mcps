export class WpengineError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "WpengineError"
  }
}

export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}

const UA = { "User-Agent": "awesome-mcps/1.0" }

function envStrict(name: string): string {
  const v = process.env[name]
  if (!v) throw new WpengineError(`Set the ${name} environment variable.`)
  return v
}

async function authHeaders(): Promise<Record<string, string>> {
  const u = envStrict("WPENGINE_USERNAME");
  const p = envStrict("WPENGINE_PASSWORD");
  return { Authorization: "Basic " + Buffer.from(`${u}:${p}`).toString("base64") };
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
    throw new WpengineError(`HTTP ${res.status}: ${detail}`)
  }
  return data
}

export async function listInstalls(): Promise<string> {
  let url = `https://api.wpengineapi.com/v1/installs`;
  const data = await req(url);
  return pretty(data);
}

export async function getInstall(installId: string): Promise<string> {
  let url = `https://api.wpengineapi.com/v1/installs/${encodeURIComponent(String(installId))}`;
  const data = await req(url);
  return pretty(data);
}

export async function listSites(): Promise<string> {
  let url = `https://api.wpengineapi.com/v1/sites`;
  const data = await req(url);
  return pretty(data);
}
