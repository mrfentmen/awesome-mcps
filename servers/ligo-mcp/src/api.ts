/**
 * Gravitational-Wave Open Science Center event API client, keyless.
 * Docs: https://gwosc.org/api/
 */
const BASE = "https://gwosc.org/eventapi"

export class LigoError extends Error {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "User-Agent": "ligo-mcp/1.0", Accept: "application/json" },
    redirect: "follow",
    signal: AbortSignal.timeout(25000),
  })
  if (res.status === 404) throw new LigoError("Not found.")
  if (!res.ok) throw new LigoError(`GWOSC error ${res.status}`)
  return (await res.json()) as T
}

let catalogCache: string[] | null = null

export async function listCatalogs(): Promise<string[]> {
  if (catalogCache) return catalogCache
  const data = await getJson<Raw>("/")
  catalogCache = Object.keys(data).sort()
  return catalogCache
}

export interface GwEvent {
  name: string
  version?: number
  gps?: number
  catalog?: string
}

export async function listEvents(catalog = "GWTC", limit = 10): Promise<GwEvent[]> {
  const clean = catalog.trim() || "GWTC"
  const known = await listCatalogs().catch(() => [] as string[])
  if (known.length > 0 && !known.includes(clean)) {
    throw new LigoError(`Unknown catalog "${catalog}". Use list_catalogs for valid names.`)
  }
  const data = await getJson<Raw>(`/json/${encodeURIComponent(clean)}/`)
  const events: Raw = data.events ?? {}
  const names = Object.keys(events).slice(0, limit)
  return names.map((n) => {
    const e: Raw = events[n] ?? {}
    return {
      name: String(e.commonName ?? n),
      version: e.version,
      gps: e.GPS,
      catalog: e["catalog.shortName"] ?? clean,
    }
  })
}

export async function getEvent(name: string): Promise<string> {
  const clean = name.trim().toUpperCase()
  if (!/^GW\d+(_\d+)?$/.test(clean)) {
    throw new LigoError(`Not an event name: "${name}". Try "GW150914" (use list_events).`)
  }
  const lines: string[] = [`${clean}`]
  for (const cat of ["GWTC", "GWTC-1-confident", "GWTC-3-confident", "GWTC-4.0", "GWTC-5.0"]) {
    try {
      const data = await getJson<Raw>(`/json/${cat}/`)
      const events: Raw = data.events ?? {}
      const key = Object.keys(events).find((k) => k.toUpperCase().startsWith(clean))
      if (key) {
        const e: Raw = events[key]
        lines.push(
          `Catalog: ${e["catalog.shortName"] ?? cat}`,
          `GPS: ${e.GPS ?? "?"}`,
          `Version: ${e.version ?? "?"}`,
          e.jsonurl ? `Data: ${e.jsonurl}` : ""
        )
        return lines.filter(Boolean).join("\n")
      }
    } catch {
      continue
    }
  }
  return `${clean}: not found in GWTC catalogs.`
}

export function formatEvent(e: GwEvent, index?: number): string {
  const prefix = index !== undefined ? `${index + 1}. ` : ""
  return `${prefix}${e.name}${e.catalog ? ` [${e.catalog}]` : ""}${e.gps ? ` (GPS ${e.gps})` : ""}`
}
