const UA = "mrfentmen-isbn-mcp/1.0 (https://github.com/mrfentmen)"
export class IsbnError extends Error {}

function cleanIsbn(raw: string): string {
  return raw.replace(/[^0-9Xx]/g, "").toUpperCase()
}

function validIsbn10(s: string): boolean {
  if (!/^\d{9}[\dX]$/.test(s)) return false
  let sum = 0
  for (let i = 0; i < 10; i++) {
    const v = s[i] === "X" ? 10 : Number(s[i])
    sum += v * (10 - i)
  }
  return sum % 11 === 0
}

function validIsbn13(s: string): boolean {
  if (!/^\d{13}$/.test(s)) return false
  let sum = 0
  for (let i = 0; i < 13; i++) {
    sum += Number(s[i]) * (i % 2 === 0 ? 1 : 3)
  }
  return sum % 10 === 0
}

export async function validate(args: { isbn?: string }): Promise<string> {
  const raw = (args.isbn ?? "").trim()
  if (!raw) throw new IsbnError("Provide an ISBN")
  const s = cleanIsbn(raw)
  if (s.length === 10) return `${raw} is a ${validIsbn10(s) ? "VALID" : "INVALID"} ISBN-10`
  if (s.length === 13) return `${raw} is a ${validIsbn13(s) ? "VALID" : "INVALID"} ISBN-13`
  return `${raw} is not a recognized ISBN length (10 or 13 digits)`
}

export async function lookup(args: { isbn?: string }): Promise<string> {
  const raw = (args.isbn ?? "").trim()
  if (!raw) throw new IsbnError("Provide an ISBN")
  const s = cleanIsbn(raw)
  if (s.length === 10 && !validIsbn10(s)) throw new IsbnError("Invalid ISBN-10 checksum")
  if (s.length === 13 && !validIsbn13(s)) throw new IsbnError("Invalid ISBN-13 checksum")
  const res = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${s}&format=json&jscmd=data`, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(20000),
  })
  if (!res.ok) throw new IsbnError(`Open Library error ${res.status}`)
  const d = (await res.json()) as any
  const b = d?.[`ISBN:${s}`]
  if (!b) return `No book found for ISBN ${s}`
  const lines = [
    `Title: ${b.title ?? "n/a"}`,
    b.subtitle ? `Subtitle: ${b.subtitle}` : "",
    b.authors?.length ? `Authors: ${b.authors.map((a: any) => a.name).join(", ")}` : "",
    b.publishers?.length ? `Publishers: ${b.publishers.map((p: any) => p.name).join(", ")}` : "",
    b.publish_date ? `Published: ${b.publish_date}` : "",
    b.number_of_pages ? `Pages: ${b.number_of_pages}` : "",
  ].filter(Boolean)
  if (b.cover?.large) lines.push(`Cover: ${b.cover.large}`)
  return lines.join("\n")
}
