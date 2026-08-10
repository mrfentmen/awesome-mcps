const KEY = process.env.NASA_API_KEY || "DEMO_KEY"
const BASE = "https://api.nasa.gov"
export class NasaError extends Error {}

async function request<T>(url: string, retries = 3): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(25000) })
      if (!res.ok) {
        if (res.status === 429 && attempt < retries) {
          const wait = 10000 * (attempt + 1)
          await new Promise((r) => setTimeout(r, wait))
          continue
        }
        throw new NasaError(`NASA error ${res.status}${res.status === 429 ? " (rate limit, try again shortly or set NASA_API_KEY)" : ""}`)
      }
      return (await res.json()) as T
    } catch (e) {
      if (e instanceof NasaError) throw e
      if (attempt >= retries) throw e
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)))
    }
  }
}

export async function apod(_args: Record<string, never>): Promise<string> {
  const d = await request<any>(`${BASE}/planetary/apod?api_key=${KEY}`)
  return `# ${d.title ?? "APOD"}\n${d.date ?? ""} | ${d.copyright ?? "public domain"}\n${d.explanation ?? ""}`
}

export async function neo(args: { start_date?: string; end_date?: string }): Promise<string> {
  const today = new Date().toISOString().slice(0, 10)
  const start = args.start_date || today
  const end = args.end_date || today
  const d = await request<any>(`${BASE}/neo/rest/v1/feed?start_date=${start}&end_date=${end}&api_key=${KEY}`)
  const out: string[] = []
  for (const [date, objs] of Object.entries(d.near_earth_objects ?? {})) {
    for (const o of (objs as any[]).slice(0, 5)) {
      out.push(`${date} | ${o.name ?? ""} | ${(o.estimated_diameter?.kilometers?.estimated_diameter_max ?? 0).toFixed(2)} km | ${o.is_potentially_hazardous_asteroid ? "HAZARDOUS" : "safe"}`)
    }
  }
  return `Near Earth Objects ${start} to ${end}\n${out.join("\n") || "None found"}`
}

export async function marsPhotos(args: { rover?: string; sol?: number; camera?: string }): Promise<string> {
  const rover = args.rover || "curiosity"
  const sol = args.sol ?? 1000
  const camera = args.camera ? `&camera=${args.camera}` : ""
  const d = await request<any>(`${BASE}/mars-photos/api/v1/rovers/${rover}/photos?sol=${sol}${camera}&api_key=${KEY}`)
  const photos = (d.photos ?? []).slice(0, 12)
  return `Mars ${rover} sol ${sol} photos: ${photos.length}\n${photos.map((p: any) => `${p.id} | ${p.camera?.full_name ?? ""} | ${p.img_src ?? ""}`).join("\n") || "No photos found"}`
}
