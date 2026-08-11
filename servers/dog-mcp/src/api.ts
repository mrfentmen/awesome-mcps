const CEO_BASE = 'https://dog.ceo/api';
const DOGAPI_BASE = 'https://dogapi.dog/api/v2';
const RANDOM_BASE = 'https://random.dog';
const UA = 'mrfentmen-dog-mcp/1.0 (https://github.com/mrfentmen)';
export class DogError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' }, signal: AbortSignal.timeout(20000) });
  if (res.status === 429) throw new DogError('dog.ceo rate limit hit, wait and retry');
  if (!res.ok) throw new DogError(`Dog API error ${res.status}`);
  return (await res.json()) as T;
}

export async function listBreeds(_args: Record<string, never> = {}): Promise<string> {
  const d = await get<{ message?: Record<string, string[]> }>(`${CEO_BASE}/breeds/list/all`);
  const breeds = d.message ?? {};
  const names = Object.entries(breeds)
    .map(([breed, subs]) => (subs.length ? `${breed} (${subs.join(', ')})` : breed));
  return `${names.length} breeds\n${names.slice(0, 60).join('\n')}`;
}

export async function randomImage(args: { breed?: string }): Promise<string> {
  const breed = (args.breed ?? '').trim().toLowerCase();
  const url = breed
    ? `${CEO_BASE}/breed/${encodeURIComponent(breed)}/images/random`
    : `${CEO_BASE}/breeds/image/random`;
  const d = await get<{ message?: string; status?: string }>(url);
  if (d.status === 'error') throw new DogError(d.message ?? `Breed "${breed}" not found`);
  return `Random dog photo${breed ? ` (${breed})` : ''}: ${d.message ?? 'no image returned'}`;
}

export async function breedImages(args: { breed?: string; limit?: number }): Promise<string> {
  const breed = (args.breed ?? '').trim().toLowerCase();
  if (!breed) throw new DogError('Provide a breed name');
  const limit = Math.max(1, Math.min(args.limit ?? 3, 8));
  const d = await get<{ message?: string[]; status?: string }>(`${CEO_BASE}/breed/${encodeURIComponent(breed)}/images/random/${limit}`);
  if (d.status === 'error') throw new DogError((d.message ?? []).join(', ') || `Breed "${breed}" not found`);
  return `${breed} (${(d.message ?? []).length} images):\n${(d.message ?? []).join('\n')}`;
}

export async function facts(args: { limit?: number }): Promise<string> {
  const n = Math.max(1, Math.min(args.limit ?? 1, 10));
  const d = await get<{ data?: Array<{ attributes: { body: string } }> }>(`${DOGAPI_BASE}/facts?limit=${n}`);
  const list = (d.data ?? []).map((f) => f.attributes.body).filter(Boolean);
  if (!list.length) return 'No dog facts available right now.';
  return list.map((f, i) => `${i + 1}. ${f}`).join('\n');
}

export async function randomMedia(_args: Record<string, never> = {}): Promise<string> {
  const res = await fetch(`${RANDOM_BASE}/woof.json`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new DogError(`random.dog returned ${res.status}`);
  const d = (await res.json()) as { url?: string; fileSizeBytes?: number; urlSuffix?: string };
  return [
    `Random dog:`,
    `URL: ${d.url ?? '?'}`,
    d.fileSizeBytes ? `Size: ${(d.fileSizeBytes / 1024).toFixed(0)} KB` : null,
    d.urlSuffix ? `Suffix: ${d.urlSuffix}` : null,
  ].filter(Boolean).join('\n');
}
