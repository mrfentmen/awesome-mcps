const UA = "mrfentmen-fdic-mcp/1.0 (https://github.com/mrfentmen)"
export class FdicError extends Error {}

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`https://api.fdic.gov${path}`, {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(25000),
  })
  if (!res.ok) throw new FdicError(`FDIC error ${res.status}`)
  return (await res.json()) as T
}

function fmt(rows: any[]): string {
  return rows
    .map((r: any) => {
      const d = r.data ?? r
      const asset = Number(d.ASSET ?? 0) * 1000
      const dep = Number(d.DEP ?? 0) * 1000
      return `${d.NAME ?? ""} | ${d.CITY ?? ""}, ${d.STNAME ?? ""}\n  Assets $${asset.toLocaleString()} | Deposits $${dep.toLocaleString()}`
    })
    .join("\n\n")
}

export async function institutions(args: { name?: string; limit?: number }): Promise<string> {
  const limit = Math.min(args.limit ?? 10, 50)
  const name = args.name?.trim() ?? ""
  const filter = name ? `&filters=NAME:(${encodeURIComponent(name)}*)` : ""
  const d = await request<any>(
    `/banks/institutions?limit=${limit}&fields=NAME,CITY,STNAME,ASSET,DEP${filter}&sort_by=ASSET&sort_order=DESC`
  )
  const rows = d.data ?? []
  return `FDIC insured institutions (${d.meta?.total ?? rows.length} matched)\n${fmt(rows) || "None found"}`
}

export async function largestBanks(args: { limit?: number }): Promise<string> {
  const limit = Math.min(args.limit ?? 10, 50)
  const d = await request<any>(
    `/banks/institutions?limit=${limit}&fields=NAME,CITY,STNAME,ASSET,DEP&sort_by=ASSET&sort_order=DESC`
  )
  const rows = d.data ?? []
  return `Largest FDIC insured institutions\n${fmt(rows)}`
}
