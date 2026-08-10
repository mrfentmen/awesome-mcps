const BASE = "https://api.dictionaryapi.dev/api/v2/entries/en"
const UA = "mrfentmen-word-of-day-mcp/1.0 (https://github.com/mrfentmen)"
export class WordError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(20000) })
  if (res.status === 404) throw new WordError("No word available right now")
  if (!res.ok) throw new WordError(`Dictionary error ${res.status}`)
  return (await res.json()) as T
}

// Deterministic word pick per UTC day from a curated list, then fetch its real definition.
const WORDS = ["serendipity", "ephemeral", "luminous", "resilient", "eloquent", "meticulous", "curiosity", "zenith", "quintessential", "effervescent", "solstice", "wanderlust", "euphoria", "tranquil", "vibrant"]

function wordForToday(): string {
  const day = Math.floor(Date.now() / 86400000)
  return WORDS[day % WORDS.length]
}

export async function wordOfTheDay(_args: Record<string, never>): Promise<string> {
  const word = wordForToday()
  const d = await get<any[]>(`${BASE}/${word}`)
  const entry = d[0] ?? {}
  const phonetic = (entry.phonetics ?? []).map((p: any) => p.text).filter(Boolean)[0] ?? ""
  const meaning = (entry.meanings ?? [])[0] ?? {}
  const firstDef = (meaning.definitions ?? [])[0]?.definition ?? ""
  const example = (meaning.definitions ?? [])[0]?.example
  return `Word of the day: ${entry.word ?? word}\n${phonetic ? `Pronunciation: ${phonetic}\n` : ""}${meaning.partOfSpeech ? `Part of speech: ${meaning.partOfSpeech}\n` : ""}Definition: ${firstDef}${example ? `\nExample: ${example}` : ""}`
}

export async function randomWord(_args: Record<string, never>): Promise<string> {
  const d = await get<any[]>(`${BASE}/random`)
  const entry = d[0] ?? {}
  const meaning = (entry.meanings ?? [])[0] ?? {}
  const firstDef = (meaning.definitions ?? [])[0]?.definition ?? ""
  return `${entry.word ?? "word"}\n${meaning.partOfSpeech ?? ""}: ${firstDef}`
}
