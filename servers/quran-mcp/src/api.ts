const ALQURAN_BASE = 'https://api.alquran.cloud/v1';
const QURANCOM_BASE = 'https://api.quran.com/api/v4';
const UA = 'mrfentmen-quran-mcp/1.0 (https://github.com/mrfentmen)';
export class QuranError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' }, signal: AbortSignal.timeout(25000) });
  if (res.status === 429) throw new QuranError('Quran API rate limit hit, wait and retry');
  if (!res.ok) throw new QuranError(`Quran API error ${res.status}`);
  return (await res.json()) as T;
}

export async function verse(args: { chapter?: number; verse?: number }): Promise<string> {
  const chapter = args.chapter;
  const verseNum = args.verse;
  if (chapter === undefined || verseNum === undefined || chapter < 1 || chapter > 114 || verseNum < 1) {
    throw new QuranError('Provide a chapter (1 to 114) and verse number');
  }
  const d = await get<any>(`${ALQURAN_BASE}/ayah/${chapter}:${verseNum}/editions/quran-uthmani,en.asad`);
  const editions = d?.data ?? [];
  const ar = editions.find((e: any) => e?.edition?.identifier === 'quran-uthmani');
  const en = editions.find((e: any) => e?.edition?.identifier === 'en.asad');
  return `${ar?.text ?? ''}\n\n${en?.text ?? 'no translation'}\n\nSurah ${chapter}:${verseNum} (${en?.surah?.englishName ?? ''})`;
}

export async function surahInfo(args: { chapter?: number }): Promise<string> {
  const chapter = args.chapter;
  if (chapter === undefined || chapter < 1 || chapter > 114) throw new QuranError('Provide a chapter number 1 to 114');
  const d = await get<any>(`${ALQURAN_BASE}/surah/${chapter}/en.asad`);
  const s = d?.data ?? {};
  return `Surah ${s.number}: ${s.englishName} (${s.name})\nRevelation: ${s.revelationType ?? 'n/a'} | Verses: ${s.numberOfAyahs ?? 'n/a'}\n\n${(s.ayahs ?? []).slice(0, 3).map((a: any) => `${a.numberInSurah}. ${a.text}`).join('\n')}${(s.ayahs?.length ?? 0) > 3 ? `\n... and ${s.ayahs.length - 3} more verses` : ''}`;
}

export async function chapters(_args: Record<string, never> = {}): Promise<string> {
  const d = await get<{ chapters?: Array<{ id?: number; name_simple?: string; name_arabic?: string; verses_count?: number; revelation_place?: string }> }>(`${QURANCOM_BASE}/chapters?language=en`);
  const chapters = d.chapters ?? [];
  if (!chapters.length) return 'No chapters returned.';
  return `Quran.com chapters (${chapters.length}):\n` +
    chapters.map((c, i) => `${i + 1}. ${c.id ?? '?'}. ${c.name_simple ?? '?'} (${c.name_arabic ?? ''}) ${c.verses_count ?? '?'} verses [${c.revelation_place ?? ''}]`.trim()).join('\n');
}

export async function chapter(args: { id?: number }): Promise<string> {
  const id = Number(args.id);
  if (!Number.isFinite(id) || id <= 0) return 'Provide a chapter id.';
  const d = await get<{ chapter?: { id?: number; name_simple?: string; name_arabic?: string; translated_name?: { name?: string }; verses_count?: number; revelation_place?: string; pages?: [number, number] } }>(`${QURANCOM_BASE}/chapters/${id}?language=en`);
  const c = d.chapter ?? {};
  return [
    `Quran chapter ${c.id ?? id}: ${c.name_simple ?? '?'} (${c.name_arabic ?? ''})`,
    `Translated: ${c.translated_name?.name ?? '?'}`,
    `${c.verses_count ?? '?'} verses | ${c.revelation_place ?? '?'}`,
    c.pages ? `Pages: ${c.pages[0]}-${c.pages[1]}` : null,
  ].filter(Boolean).join('\n');
}
