const BASE = 'https://api.quran.com/api/v4';
const UA = 'mrfentmen-qurancom-mcp/1.0';

export async function chapters(_args?: unknown): Promise<string> {
  const res = await fetch(`${BASE}/chapters?language=en`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Quran.com returned ${res.status}`);
  const d = (await res.json()) as { chapters?: Array<{ id?: number; name_simple?: string; name_arabic?: string; verses_count?: number; revelation_place?: string }> };
  const chapters = d.chapters ?? [];
  if (!chapters.length) return 'No chapters returned.';
  return `Quran.com chapters (${chapters.length}):\n` +
    chapters.map((c, i) => `${i + 1}. ${c.id ?? '?'}. ${c.name_simple ?? '?'} (${c.name_arabic ?? ''}) ${c.verses_count ?? '?'} verses [${c.revelation_place ?? ''}]`.trim()).join('\n');
}

export interface ChapterArgs {
  id: number;
}

export async function chapter(args: ChapterArgs): Promise<string> {
  const id = Number(args.id);
  if (!Number.isFinite(id) || id <= 0) return 'Provide a chapter id.';
  const res = await fetch(`${BASE}/chapters/${id}?language=en`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Quran.com returned ${res.status}`);
  const d = (await res.json()) as { chapter?: { id?: number; name_simple?: string; name_arabic?: string; translated_name?: { name?: string }; verses_count?: number; revelation_place?: string; pages?: [number, number] } };
  const c = d.chapter ?? {};
  return [
    `Quran chapter ${c.id ?? id}: ${c.name_simple ?? '?'} (${c.name_arabic ?? ''})`,
    `Translated: ${c.translated_name?.name ?? '?'}`,
    `${c.verses_count ?? '?'} verses | ${c.revelation_place ?? '?'}`,
    c.pages ? `Pages: ${c.pages[0]}-${c.pages[1]}` : null,
  ].filter(Boolean).join('\n');
}
