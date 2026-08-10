const UA = "mrfentmen-scrabble-mcp/1.0"
export class ScrabbleError extends Error {}

const VALUES: Record<string, number> = {
  a: 1, e: 1, i: 1, o: 1, u: 1, l: 1, n: 1, s: 1, t: 1, r: 1,
  d: 2, g: 2,
  b: 3, c: 3, m: 3, p: 3,
  f: 4, h: 4, v: 4, w: 4, y: 4,
  k: 5,
  j: 8, x: 8,
  q: 10, z: 10,
}

export async function wordScore(args: { word?: string }): Promise<string> {
  const word = (args.word ?? "").trim().toLowerCase()
  if (!word) throw new ScrabbleError("Provide a word to score")
  if (!/^[a-z]+$/.test(word)) throw new ScrabbleError("Only letters are allowed")
  const breakdown = word.split("").map((c) => `${c}:${VALUES[c] ?? 0}`).join(" ")
  const total = word.split("").reduce((sum, c) => sum + (VALUES[c] ?? 0), 0)
  const bingo = word.length === 7 ? "\n7 letters: +50 bingo bonus" : ""
  return `"${word}"\n${breakdown}\nBase score: ${total}${bingo}\nTotal: ${total + (word.length === 7 ? 50 : 0)}`
}
