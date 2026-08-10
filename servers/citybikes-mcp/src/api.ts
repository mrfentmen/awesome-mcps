const BASE = "https://api.citybik.es/v2"
const UA = "mrfentmen-citybikes-mcp/1.0 (https://github.com/mrfentmen)"
export class CitybikesError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new CitybikesError(`CityBikes returned HTTP ${res.status}`)
  return (await res.json()) as T
}

export async function networks(_args?: unknown): Promise<string> {
  const d = await get<any>(`${BASE}/networks`)
  const nets = (d?.networks ?? []) as any[]
  if (!nets.length) return "No networks found"
  const lines = nets.map((n, i) => {
    const loc = n?.location ?? {}
    return `${i + 1}. ${n?.name ?? "n/a"} (${n?.id ?? "n/a"}) | ${loc?.city ?? ""}, ${loc?.country ?? ""}`
  })
  return `Bike share networks (${nets.length} total, showing first 50):\n` + lines.slice(0, 50).join("\n")
}

export async function network(args: { id?: string }): Promise<string> {
  const id = (args.id ?? "").trim()
  if (!id) throw new CitybikesError("Provide a network ID like bixi-montreal")
  const d = await get<any>(`${BASE}/networks/${encodeURIComponent(id)}`)
  const n = d?.network
  if (!n) throw new CitybikesError(`Network not found: ${id}`)
  const stations = (n?.stations ?? []) as any[]
  if (!stations.length) return `${n?.name ?? id}: network found but no stations reported`
  const total = stations.length
  const withBikes = stations.filter((s) => (s?.free_bikes ?? 0) > 0).length
  const lines = [
    `${n?.name ?? id} | ${n?.location?.city ?? ""}, ${n?.location?.country ?? ""}`,
    `${total} stations, ${withBikes} with bikes available`,
    "",
    ...stations.slice(0, 20).map((s, i) => {
      const bikes = s?.free_bikes ?? 0
      const slots = s?.empty_slots ?? 0
      return `${i + 1}. ${s?.name ?? "n/a"} | bikes ${bikes} | slots ${slots}`
    }),
  ]
  if (total > 20) lines.push(`... and ${total - 20} more stations`)
  return lines.join("\n")
}
