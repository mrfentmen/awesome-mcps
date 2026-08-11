const m0 = (() => {
const BASE = "https://api.dictionaryapi.dev/api/v2/entries/en"
const UA = "mrfentmen-dictionary-mcp/1.0 (https://github.com/mrfentmen)"
class DictError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(20000) })
  if (res.status === 404) throw new DictError("Word not found")
  if (!res.ok) throw new DictError(`Dictionary error ${res.status}`)
  return (await res.json()) as T
}

async function define(args: { word?: string }): Promise<string> {
  const word = (args.word ?? "").trim()
  if (!word) throw new DictError("Provide a word")
  const d = await get<any[]>(`${BASE}/${encodeURIComponent(word)}`)
  const entry = d[0] ?? {}
  const phonetics = (entry.phonetics ?? []).map((p: any) => p.text).filter(Boolean).join(", ")
  const meanings = (entry.meanings ?? []).slice(0, 3).map((m: any) => {
    const defs = (m.definitions ?? []).slice(0, 3).map((df: any, i: number) => `${i + 1}. ${df.definition ?? ""}${df.example ? ` (e.g. ${df.example})` : ""}`).join("\n   ")
    return `${m.partOfSpeech ?? ""}\n   ${defs}`
  }).join("\n")
  return `${entry.word ?? word}\n${phonetics ? `Phonetics: ${phonetics}\n` : ""}${meanings || "No definitions"}`
}

async function wordOfDay(_args: Record<string, never>): Promise<string> {
  const d = await get<any[]>(`${BASE}/random`)
  const entry = d[0] ?? {}
  const meanings = (entry.meanings ?? []).slice(0, 2).map((m: any) => {
    const defs = (m.definitions ?? []).slice(0, 2).map((df: any) => df.definition ?? "").join("; ")
    return `${m.partOfSpeech ?? ""}: ${defs}`
  }).join("\n")
  return `Word: ${entry.word ?? ""}\n${meanings || "No definitions"}`
}

return { DictError, define, wordOfDay };
})();

const m1 = (() => {
const BASE = "https://api.dictionaryapi.dev/api/v2/entries/en"
const UA = "mrfentmen-word-of-day-mcp/1.0 (https://github.com/mrfentmen)"
class WordError extends Error {}

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

async function wordOfTheDay(_args: Record<string, never>): Promise<string> {
  const word = wordForToday()
  const d = await get<any[]>(`${BASE}/${word}`)
  const entry = d[0] ?? {}
  const phonetic = (entry.phonetics ?? []).map((p: any) => p.text).filter(Boolean)[0] ?? ""
  const meaning = (entry.meanings ?? [])[0] ?? {}
  const firstDef = (meaning.definitions ?? [])[0]?.definition ?? ""
  const example = (meaning.definitions ?? [])[0]?.example
  return `Word of the day: ${entry.word ?? word}\n${phonetic ? `Pronunciation: ${phonetic}\n` : ""}${meaning.partOfSpeech ? `Part of speech: ${meaning.partOfSpeech}\n` : ""}Definition: ${firstDef}${example ? `\nExample: ${example}` : ""}`
}

async function randomWord(_args: Record<string, never>): Promise<string> {
  const d = await get<any[]>(`${BASE}/random`)
  const entry = d[0] ?? {}
  const meaning = (entry.meanings ?? [])[0] ?? {}
  const firstDef = (meaning.definitions ?? [])[0]?.definition ?? ""
  return `${entry.word ?? "word"}\n${meaning.partOfSpeech ?? ""}: ${firstDef}`
}

return { WordError, randomWord, wordOfTheDay };
})();

export const DictError = m0.DictError;
export const WordError = m1.WordError;
export const define = m0.define;
export const randomWord = m1.randomWord;
export const wordOfDay = m0.wordOfDay;
export const wordOfTheDay = m1.wordOfTheDay;
export const m0_DictError = m0.DictError;
export const m0_wordOfDay = m0.wordOfDay;
export const m0_define = m0.define;
export const m1_wordOfTheDay = m1.wordOfTheDay;
export const m1_WordError = m1.WordError;
export const m1_randomWord = m1.randomWord;
