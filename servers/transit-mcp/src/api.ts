const UA = "mrfentmen-transit-mcp/1.0 (https://github.com/mrfentmen)"
export class TransitError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(25000) })
  if (!res.ok) throw new TransitError(`SEPTA error ${res.status}`)
  return (await res.json()) as T
}

export async function nextArrivals(args: { origin?: string; destination?: string }): Promise<string> {
  const o = encodeURIComponent(args.origin ?? "")
  const d = encodeURIComponent(args.destination ?? "")
  const rows = await get<any[]>(`https://www3.septa.org/api/NextToArrive/index.php?req1=${o}&req2=${d}&req3=10`)
  if (!rows?.length) return "No arrivals found"
  return `Next arrivals ${args.origin} to ${args.destination}\n${rows.map((r: any) =>
    `${r.orig_train ?? "?"} | ${r.orig_departure_time ?? ""} -> ${r.dest_arrival_time ?? ""} | ${r.status ?? ""}`
  ).join("\n")}`
}

export async function transitView(args: { route?: string }): Promise<string> {
  const r = encodeURIComponent(args.route ?? "")
  const d = await get<any>(`https://www3.septa.org/api/TransitView/index.php?route=${r}`)
  const buses = d.bus ?? []
  if (!buses.length) return `No live vehicles for route ${args.route}`
  return `Live vehicles on route ${args.route}\n${buses.slice(0, 25).map((b: any) =>
    `${b.label ?? "bus"} | ${b.block ?? ""} | ${b.lat ?? ""}, ${b.lng ?? ""} | ${b.direction ?? ""}`
  ).join("\n")}`
}
