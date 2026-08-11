const UA = 'mrfentmen-nextbus-mcp/1.0';
const BASE = 'https://retro.umoiq.com/service/publicJSONFeed';

interface Agency {
  tag?: string;
  title?: string;
}
interface Route {
  tag?: string;
  title?: string;
}
interface Prediction {
  minutes?: number;
  vehicle?: string;
  block?: string;
  tripTag?: string;
}
interface PredictionDir {
  title?: string;
  prediction?: Prediction[] | Prediction;
}

function toArray<T>(x: T[] | T | undefined): T[] {
  if (x == null) return [];
  return Array.isArray(x) ? x : [x];
}

export interface AgencyArg {
  agency: string;
}
export interface StopArg {
  agency: string;
  stop: string;
  route?: string;
}

export async function agencies(_args?: Record<string, never>): Promise<string> {
  const res = await fetch(`${BASE}?command=agencyList`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`NextBus returned ${res.status}`);
  const d = (await res.json()) as { agency?: Agency[] | Agency };
  const list = toArray(d.agency);
  if (!list.length) return 'No agencies returned.';
  return `NextBus agencies (${list.length}):\n` + list.slice(0, 20).map((a) => `* ${a.tag ?? '?'} - ${a.title ?? '?'}`).join('\n');
}

export async function routes(args: AgencyArg): Promise<string> {
  const res = await fetch(`${BASE}?command=routeList&a=${encodeURIComponent(args.agency)}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`NextBus returned ${res.status}`);
  const d = (await res.json()) as { route?: Route[] | Route };
  const list = toArray(d.route);
  if (!list.length) return `No routes for agency ${args.agency}.`;
  return `Routes for ${args.agency} (${list.length}):\n` + list.slice(0, 20).map((r) => `* ${r.tag ?? '?'} - ${r.title ?? '?'}`).join('\n');
}

export async function predictions(args: StopArg): Promise<string> {
  const url = `${BASE}?command=predictions&a=${encodeURIComponent(args.agency)}&stopId=${encodeURIComponent(args.stop)}${args.route ? `&routeTag=${encodeURIComponent(args.route)}` : ''}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`NextBus returned ${res.status}`);
  const d = (await res.json()) as { predictions?: Array<{ routeTag?: string; routeTitle?: string; stopTitle?: string; direction?: PredictionDir[] | PredictionDir }> };
  const preds = d.predictions ?? [];
  if (!preds.length) return `No predictions for stop ${args.stop} on ${args.agency}.`;
  const lines: string[] = [];
  for (const p of preds) {
    const dirs = toArray(p.direction);
    for (const dir of dirs) {
      const mins = toArray(dir.prediction).map((pr) => `${pr.minutes} min`).join(', ');
      lines.push(`* ${p.routeTitle ?? p.routeTag ?? '?'} to ${dir.title ?? '?'}: ${mins || 'none'}`);
    }
  }
  return `Predictions at ${preds[0]?.stopTitle ?? args.stop} (${args.agency}):\n` + lines.join('\n');
}
