
export interface m2_BrowseArgs {
  limit?: number;
}

export interface m3_PhotosArgs {
  rover?: string;
  sol?: number;
  limit?: number;
}

export interface m4_ProjectArgs {
  id: number;
}

const m0 = (() => {
const KEY = process.env.NASA_API_KEY || "DEMO_KEY"
const BASE = "https://api.nasa.gov"
class NasaError extends Error {}

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

async function apod(_args: Record<string, never>): Promise<string> {
  const d = await request<any>(`${BASE}/planetary/apod?api_key=${KEY}`)
  return `# ${d.title ?? "APOD"}\n${d.date ?? ""} | ${d.copyright ?? "public domain"}\n${d.explanation ?? ""}`
}

async function neo(args: { start_date?: string; end_date?: string }): Promise<string> {
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

async function marsPhotos(args: { rover?: string; sol?: number; camera?: string }): Promise<string> {
  const rover = args.rover || "curiosity"
  const sol = args.sol ?? 1000
  const camera = args.camera ? `&camera=${args.camera}` : ""
  const d = await request<any>(`${BASE}/mars-photos/api/v1/rovers/${rover}/photos?sol=${sol}${camera}&api_key=${KEY}`)
  const photos = (d.photos ?? []).slice(0, 12)
  return `Mars ${rover} sol ${sol} photos: ${photos.length}\n${photos.map((p: any) => `${p.id} | ${p.camera?.full_name ?? ""} | ${p.img_src ?? ""}`).join("\n") || "No photos found"}`
}

return { NasaError, apod, marsPhotos, neo };
})();

const m1 = (() => {
const KEY = process.env.NASA_API_KEY || "DEMO_KEY"
const BASE = "https://api.nasa.gov/insight_weather"
const UA = "mrfentmen-mars-weather-mcp/1.0 (https://github.com/mrfentmen)"
class MarsError extends Error {}

async function latestWeather(_args: Record<string, never>): Promise<string> {
  let lastErr: unknown
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(`${BASE}/?api_key=${KEY}&feedtype=json&ver=1.0`, {
        headers: { "User-Agent": UA },
        signal: AbortSignal.timeout(30000),
      })
      if (res.status === 429 && attempt < 3) {
        await new Promise((r) => setTimeout(r, 10000 * (attempt + 1)))
        continue
      }
      if (!res.ok) {
        throw new MarsError(`NASA error ${res.status}${res.status === 429 ? " (rate limit, try later or set NASA_API_KEY)" : ""}`)
      }
      const d = await res.json()
      const sols = d.sol_keys ?? []
      const last = sols[sols.length - 1]
      if (!last) throw new MarsError("No Mars weather sols returned")
      const s = d[last] ?? {}
      const t = s.AT?.av
      const p = s.PRE?.av
      const ws = s.HWS?.av
      const wd = s.WD?.most_common?.compass_point
      return `Mars weather, sol ${last} (${s.First_UTC?.slice(0, 10) ?? ""} to ${s.Last_UTC?.slice(0, 10) ?? ""})\nAir temp: ${t ?? "n/a"} C\nPressure: ${p ? (p / 100).toFixed(2) : "n/a"} hPa\nWind speed: ${ws ?? "n/a"} m/s\nWind direction: ${wd ?? "n/a"}`
    } catch (e) {
      lastErr = e
      if (e instanceof MarsError) throw e
      if (attempt >= 3) throw lastErr
      await new Promise((r) => setTimeout(r, 2000))
    }
  }
  throw lastErr
}

return { MarsError, latestWeather };
})();

const m2 = (() => {
const BASE = 'https://api.nasa.gov/neo/rest/v1/neo/browse';


async function browse(args: m2_BrowseArgs = {}): Promise<string> {
  const limit = Math.max(1, Math.min(args.limit ?? 10, 25));
  const res = await fetch(`${BASE}?api_key=DEMO_KEY`, {
    headers: { 'User-Agent': 'mrfentmen-nasa-asteroids-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`NASA NeoWs returned ${res.status}`);
  const data = (await res.json()) as {
    near_earth_objects?: Array<Record<string, unknown>>;
  };
  const rows = data.near_earth_objects ?? [];
  if (!rows.length) return 'No near earth objects returned.';
  const shown = rows.slice(0, limit);
  return `Near Earth Objects (${rows.length} loaded, ${shown.length} shown):\n` +
    shown
      .map((a, i) => {
        const size = (a.estimated_diameter ?? {}) as Record<string, unknown>;
        const km = (size.kilometers ?? {}) as Record<string, unknown> | undefined;
        const hazard = a.is_potentially_hazardous_asteroid ? 'hazardous' : 'safe';
        const name = a.name ?? 'unnamed';
        const diameter = km?.estimated_diameter_max ? `${Number(km.estimated_diameter_max).toFixed(1)} km` : '';
        return `${i + 1}. ${name} | ${hazard}${diameter ? ` | ${diameter} max` : ''}`;
      })
      .join('\n');
}

return { browse };
})();

const m3 = (() => {
const BASE = 'https://api.nasa.gov/mars-photos/api/v1/rovers';


async function photos(args: m3_PhotosArgs = {}): Promise<string> {
  const rover = (args.rover ?? 'curiosity').trim().toLowerCase();
  const sol = args.sol ?? 1000;
  const limit = Math.max(1, Math.min(args.limit ?? 10, 25));
  const url = `${BASE}/${encodeURIComponent(rover)}/photos?sol=${sol}&page=1&api_key=DEMO_KEY`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'mrfentmen-nasa-mars-photos-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`NASA Mars Photos returned ${res.status}`);
  const data = (await res.json()) as { photos?: Array<Record<string, unknown>> };
  const rows = (data.photos ?? []).slice(0, limit);
  if (!rows.length) return `No ${rover} photos for sol ${sol}.`;
  return `${rover} rover photos, sol ${sol} (${rows.length} shown):\n` +
    rows
      .map((p, i) => {
        const camera = (p.camera ?? {}) as Record<string, unknown>;
        return `${i + 1}. ${p.id ?? 'unknown'} | ${camera.full_name ?? camera.name ?? ''} | ${p.img_src ?? ''}`;
      })
      .join('\n');
}

return { photos };
})();

const m4 = (() => {
const BASE = 'https://api.nasa.gov/techport/api/projects';


async function project(args: m4_ProjectArgs): Promise<string> {
  const id = Number(args.id);
  if (!Number.isInteger(id) || id <= 0) return 'Provide a positive TechPort project ID.';
  const res = await fetch(`${BASE}/${id}?api_key=DEMO_KEY`, {
    headers: { 'User-Agent': 'mrfentmen-nasa-techport-mcp/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`NASA TechPort returned ${res.status}`);
  const data = (await res.json()) as {
    project?: {
      title?: string;
      description?: string;
      startDateString?: string;
      endDateString?: string;
      status?: string;
      website?: string;
      principalInvestigators?: Array<{ fullName?: string }>;
    };
  };
  const p = data.project;
  if (!p?.title) return `No TechPort project found with id ${id}.`;
  const lines = [
    `Title: ${p.title}`,
    `Status: ${p.status ?? 'n/a'}`,
    `Start: ${p.startDateString ?? 'n/a'}`,
    `End: ${p.endDateString ?? 'n/a'}`,
  ];
  const pis = (p.principalInvestigators ?? []).map((pi) => pi.fullName).filter(Boolean).join(', ');
  if (pis) lines.push(`Principal investigators: ${pis}`);
  if (p.description) lines.push(`\n${p.description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 400)}`);
  if (p.website) lines.push(`\nWebsite: ${p.website}`);
  return lines.join('\n');
}

return { project };
})();

export const MarsError = m1.MarsError;
export const NasaError = m0.NasaError;
export const apod = m0.apod;
export const browse = m2.browse;
export const latestWeather = m1.latestWeather;
export const marsPhotos = m0.marsPhotos;
export const neo = m0.neo;
export const photos = m3.photos;
export const project = m4.project;
export const m0_neo = m0.neo;
export const m0_NasaError = m0.NasaError;
export const m0_apod = m0.apod;
export const m0_marsPhotos = m0.marsPhotos;
export const m1_MarsError = m1.MarsError;
export const m1_latestWeather = m1.latestWeather;
export const m2_browse = m2.browse;
export const m3_photos = m3.photos;
export const m4_project = m4.project;
