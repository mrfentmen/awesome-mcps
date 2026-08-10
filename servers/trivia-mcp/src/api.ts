const BASE = "https://opentdb.com/api.php"
const UA = "mrfentmen-trivia-mcp/1.0 (https://github.com/mrfentmen)"
export class TriviaError extends Error {}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(25000) })
  if (res.status === 429) throw new TriviaError("Open Trivia rate limit hit, wait and retry")
  if (!res.ok) throw new TriviaError(`Open Trivia error ${res.status}`)
  return (await res.json()) as T
}

const CAT_IDS: Record<string, number> = {
  general: 9, books: 10, film: 11, music: 12, theatre: 13, television: 14,
  video_games: 15, board_games: 16, nature: 17, science: 17, science_nature: 17, computers: 18, math: 19,
  mythology: 20, sports: 21, geography: 22, history: 23, politics: 24,
  art: 25, celebrities: 26, animals: 27, vehicles: 28, comics: 29,
  gadgets: 30, anime: 31, cartoons: 32,
}

export async function getQuestion(args: { category?: string; difficulty?: string }): Promise<string> {
  const params = ["amount=1", "type=multiple", "encode=url3986"]
  const cat = (args.category ?? "").trim().toLowerCase().replace(/ /g, "_")
  if (cat) {
    const id = CAT_IDS[cat]
    if (id === undefined) throw new TriviaError(`Unknown category. Use one of: ${Object.keys(CAT_IDS).join(", ")}`)
    params.push(`category=${id}`)
  }
  const diff = (args.difficulty ?? "").trim().toLowerCase()
  if (diff) {
    if (!["easy", "medium", "hard"].includes(diff)) throw new TriviaError("Difficulty must be easy, medium, or hard")
    params.push(`difficulty=${diff}`)
  }
  const d = await get<any>(`${BASE}?${params.join("&")}`)
  const q = d?.results?.[0]
  if (!q) return "No question returned"
  const decode = (s: string) => decodeURIComponent(s)
  const opts = [...(q.incorrect_answers ?? []), q.correct_answer].map(decode)
  const correct = decode(q.correct_answer)
  opts.sort(() => Math.random() - 0.5)
  return `${decode(q.question)}\n\nCategory: ${decode(q.category)} | Difficulty: ${decode(q.difficulty)}\n\n${opts.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`).join("\n")}\n\nAnswer: ${correct}`
}

export async function categories(args: Record<string, never>): Promise<string> {
  return Object.keys(CAT_IDS).map((k, i) => `${i + 1}. ${k}`).join("\n")
}
