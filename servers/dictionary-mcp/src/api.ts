const BASE = "https://api.dictionaryapi.dev/api/v2/entries/en"
const UA = "mrfentmen-dictionary-mcp/1.0 (https://github.com/mrfentmen)"
export class DictError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(20000) })
  if (res.status === 404) throw new DictError("Word not found")
  if (!res.ok) throw new DictError(`Dictionary error ${res.status}`)
  return (await res.json()) as T
}

export async function define(args: { word?: string }): Promise<string> {
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

export async function wordOfDay(_args: Record<string, never>): Promise<string> {
  const d = await get<any[]>(`${BASE}/random`)
  const entry = d[0] ?? {}
  const meanings = (entry.meanings ?? []).slice(0, 2).map((m: any) => {
    const defs = (m.definitions ?? []).slice(0, 2).map((df: any) => df.definition ?? "").join("; ")
    return `${m.partOfSpeech ?? ""}: ${defs}`
  }).join("\n")
  return `Word: ${entry.word ?? ""}\n${meanings || "No definitions"}`
}
