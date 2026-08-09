/**
 * Open Trivia Database client. Keyless trivia questions across dozens of
 * categories with difficulty and type filters.
 */
const BASE = "https://opentdb.com/api.php"
const CATS = "https://opentdb.com/api_category.php"

export class TriviaError extends Error {}

export interface TriviaCategory {
  id: number
  name: string
}

export interface Question {
  category?: string
  type?: string
  difficulty?: string
  question?: string
  correct_answer?: string
  incorrect_answers?: string[]
}

/** Decode common HTML entities in trivia text. */
export function decodeHtml(s: string): string {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&ndash;/g, "-")
    .replace(/&mdash;/g, "-")
    .replace(/&#(\d+);/g, (_m, n) => String.fromCodePoint(Number(n)))
    .replace(/&[a-z]+;/g, "")
}

export async function getCategories(): Promise<TriviaCategory[]> {
  const res = await fetch(CATS, { signal: AbortSignal.timeout(15000) })
  if (!res.ok) throw new TriviaError(`Trivia API error ${res.status}`)
  const d = await res.json()
  return d?.trivia_categories ?? []
}

export async function getQuestions(
  amount = 10,
  category?: number,
  difficulty?: string,
  type?: string,
): Promise<Question[]> {
  const p = new URLSearchParams({ amount: String(Math.min(Math.max(amount, 1), 50)) })
  if (category) p.set("category", String(category))
  if (difficulty) p.set("difficulty", difficulty)
  if (type) p.set("type", type)
  const res = await fetch(`${BASE}?${p}`, { signal: AbortSignal.timeout(15000) })
  if (!res.ok) throw new TriviaError(`Trivia API error ${res.status}`)
  const d = await res.json()
  if (d.response_code === 1) throw new TriviaError("No questions match those filters. Try another category or difficulty.")
  if (d.response_code === 2) throw new TriviaError("Invalid parameter.")
  if (d.response_code !== 0) throw new TriviaError(`Trivia API response code ${d.response_code}.`)
  return (d.results ?? []).map((q: Question) => ({
    category: q.category ? decodeHtml(q.category) : undefined,
    type: q.type,
    difficulty: q.difficulty,
    question: q.question ? decodeHtml(q.question) : undefined,
    correct_answer: q.correct_answer ? decodeHtml(q.correct_answer) : undefined,
    incorrect_answers: (q.incorrect_answers ?? []).map(decodeHtml),
  }))
}

export function formatQuestion(q: Question, index?: number): string {
  const lines = [
    `${index !== undefined ? `${index + 1}. ` : ""}${q.question ?? "?"}`,
    `Category: ${q.category ?? "?"} | Difficulty: ${q.difficulty ?? "?"} | Type: ${q.type ?? "?"}`,
    `Answer: ${q.correct_answer ?? "?"}`,
    q.incorrect_answers?.length ? `Wrong answers: ${q.incorrect_answers.join(", ")}` : "",
  ].filter(Boolean)
  return lines.join("\n")
}
