export class AnagramError extends Error {}

function canon(s: string): string {
  return s.toLowerCase().replace(/[^a-z]/g, "").split("").sort().join("")
}

function* permutations<T>(arr: T[]): Generator<T[]> {
  if (arr.length <= 1) { yield arr; return }
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)]
    for (const p of permutations(rest)) yield [arr[i], ...p]
  }
}

export async function checkAnagram(args: { a?: string; b?: string }): Promise<string> {
  const a = (args.a ?? "").trim()
  const b = (args.b ?? "").trim()
  if (!a || !b) throw new AnagramError("Provide two words")
  const is = canon(a) === canon(b) && canon(a) !== ""
  return is ? `"${a}" and "${b}" are anagrams` : `"${a}" and "${b}" are not anagrams`
}

export async function anagramsOf(args: { word?: string; limit?: number }): Promise<string> {
  const word = (args.word ?? "").trim().toLowerCase()
  if (!/^[a-z]+$/.test(word)) throw new AnagramError("Provide a word with only letters")
  const limit = Math.min(args.limit ?? 12, 100)
  const letters = word.split("")
  const seen = new Set<string>()
  const out: string[] = []
  for (const p of permutations(letters)) {
    const cand = p.join("")
    if (cand !== word && !seen.has(cand)) {
      seen.add(cand)
      out.push(cand)
      if (out.length >= limit) break
    }
  }
  return `${word}: ${out.length} rearrangements\n${out.join(", ")}`
}
