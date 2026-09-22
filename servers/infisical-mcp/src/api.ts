export class InfisicalError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "InfisicalError"
  }
}

export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}

const UA = { "User-Agent": "awesome-mcps/1.0" }

function envStrict(name: string): string {
  const v = process.env[name]
  if (!v) throw new InfisicalError(`Set the ${name} environment variable.`)
  return v
}

let cachedToken = ""
let tokenExpiresAt = 0
async function authHeaders(): Promise<Record<string, string>> {
  const now = Date.now()
  if (!cachedToken || now >= tokenExpiresAt) {
    const site = process.env.INFISICAL_SITE_URL ?? "https://app.infisical.com"
    const res = await fetch(`${site}/api/v1/auth/universal-auth/login`, {
      method: "POST",
      headers: { ...UA, "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: envStrict("INFISICAL_CLIENT_ID"), clientSecret: envStrict("INFISICAL_CLIENT_SECRET") }),
    })
    if (!res.ok) throw new InfisicalError(`Infisical login failed: HTTP ${res.status}`)
    const data = (await res.json()) as { accessToken?: string; expiresIn?: number }
    if (!data.accessToken) throw new InfisicalError("Infisical login returned no access token")
    cachedToken = data.accessToken
    tokenExpiresAt = now + (data.expiresIn ?? 7200) * 1000 - 60000
  }
  return { Authorization: "Bearer " + cachedToken }
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
    throw new InfisicalError(`HTTP ${res.status}: ${detail}`)
  }
  return data
}

export async function listSecrets(projectId: string, environment?: string, secretPath?: string): Promise<string> {
  const site = (process.env.INFISICAL_SITE_URL ?? "https://app.infisical.com").replace(/\/$/, "");
  let url = `${site}/api/v3/secrets/raw`;
  const qs = new URLSearchParams();
  qs.append("workspaceId", String(projectId));
  if (environment !== undefined) qs.append("environment", String(environment));
  if (secretPath !== undefined) qs.append("secretPath", String(secretPath));
  const qstr = qs.toString();
  if (qstr) url += (url.includes('?') ? '&' : '?') + qstr;
  const data = await req(url);
  return pretty(data);
}

export async function getSecret(projectId: string, key: string, environment?: string, secretPath?: string): Promise<string> {
  const site = (process.env.INFISICAL_SITE_URL ?? "https://app.infisical.com").replace(/\/$/, "");
  let url = `${site}/api/v3/secrets/raw/${encodeURIComponent(String(key))}`;
  const qs = new URLSearchParams();
  qs.append("workspaceId", String(projectId));
  if (environment !== undefined) qs.append("environment", String(environment));
  if (secretPath !== undefined) qs.append("secretPath", String(secretPath));
  const qstr = qs.toString();
  if (qstr) url += (url.includes('?') ? '&' : '?') + qstr;
  const data = await req(url);
  return pretty(data);
}

export async function createSecret(projectId: string, key: string, value: string, environment?: string, secretPath?: string): Promise<string> {
  const site = (process.env.INFISICAL_SITE_URL ?? "https://app.infisical.com").replace(/\/$/, "");
  let url = `${site}/api/v3/secrets/raw/${encodeURIComponent(String(key))}`;
  const data = await req(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workspaceId: projectId, environment, secretPath, secretKey: key, secretValue: value }) });
  return pretty(data);
}

export async function updateSecret(projectId: string, key: string, value: string, environment?: string, secretPath?: string): Promise<string> {
  const site = (process.env.INFISICAL_SITE_URL ?? "https://app.infisical.com").replace(/\/$/, "");
  let url = `${site}/api/v3/secrets/raw/${encodeURIComponent(String(key))}`;
  const data = await req(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workspaceId: projectId, environment, secretPath, secretKey: key, secretValue: value }) });
  return pretty(data);
}

export async function deleteSecret(projectId: string, key: string, environment?: string, secretPath?: string): Promise<string> {
  const site = (process.env.INFISICAL_SITE_URL ?? "https://app.infisical.com").replace(/\/$/, "");
  let url = `${site}/api/v3/secrets/raw/${encodeURIComponent(String(key))}`;
  const qs = new URLSearchParams();
  qs.append("workspaceId", String(projectId));
  if (environment !== undefined) qs.append("environment", String(environment));
  if (secretPath !== undefined) qs.append("secretPath", String(secretPath));
  const qstr = qs.toString();
  if (qstr) url += (url.includes('?') ? '&' : '?') + qstr;
  const data = await req(url, { method: "DELETE" });
  return pretty(data);
}
