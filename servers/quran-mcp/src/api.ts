const BASE = "https://api.alquran.cloud/v1"
const UA = "mrfentmen-quran-mcp/1.0 (https://github.com/mrfentmen)"
export class QuranError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(25000) })
  if (res.status === 429) throw new QuranError("alQuran.cloud rate limit hit, wait and retry")
  if (!res.ok) throw new QuranError(`alQuran.cloud error ${res.status}`)
  return (await res.json()) as T
}

export async function verse(args: { chapter?: number; verse?: number }): Promise<string> {
  const chapter = args.chapter
  const verseNum = args.verse
  if (chapter === undefined || verseNum === undefined || chapter < 1 || chapter > 114 || verseNum < 1) {
    throw new QuranError("Provide a chapter (1 to 114) and verse number")
  }
  const d = await get<any>(`${BASE}/ayah/${chapter}:${verseNum}/editions/quran-uthmani,en.asad`)
  const editions = d?.data ?? []
  const ar = editions.find((e: any) => e?.edition?.identifier === "quran-uthmani")
  const en = editions.find((e: any) => e?.edition?.identifier === "en.asad")
  return `${ar?.text ?? ""}\n\n${en?.text ?? "no translation"}\n\nSurah ${chapter}:${verseNum} (${en?.surah?.englishName ?? ""})`
}

export async function chapterInfo(args: { chapter?: number }): Promise<string> {
  const chapter = args.chapter
  if (chapter === undefined || chapter < 1 || chapter > 114) throw new QuranError("Provide a chapter number 1 to 114")
  const d = await get<any>(`${BASE}/surah/${chapter}/en.asad`)
  const s = d?.data ?? {}
  return `Surah ${s.number}: ${s.englishName} (${s.name})\nRevelation: ${s.revelationType ?? "n/a"} | Verses: ${s.numberOfAyahs ?? "n/a"}\n\n${(s.ayahs ?? []).slice(0, 3).map((a: any) => `${a.numberInSurah}. ${a.text}`).join("\n")}${(s.ayahs?.length ?? 0) > 3 ? `\n... and ${s.ayahs.length - 3} more verses` : ""}`
}
