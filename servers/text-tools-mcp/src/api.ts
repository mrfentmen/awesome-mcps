const UA = "mrfentmen-text-tools-mcp/1.0"
export class TextError extends Error {}

export async function slugify(args: { text?: string }): Promise<string> {
  const text = (args.text ?? "").trim()
  if (!text) throw new TextError("Provide text to slugify")
  const slug = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
  return slug || "empty-slug"
}

export async function toCase(args: { text?: string; style?: string }): Promise<string> {
  const text = (args.text ?? "").trim()
  if (!text) throw new TextError("Provide input text")
  const style = (args.style ?? "camel").toLowerCase()
  const words = text.toLowerCase().match(/[a-z0-9]+/g) ?? []
  if (!words.length) throw new TextError("No words found")
  const cap = (w: string) => w[0].toUpperCase() + w.slice(1)
  switch (style) {
    case "camel":
      return words[0] + words.slice(1).map(cap).join("")
    case "snake":
      return words.join("_")
    case "kebab":
      return words.join("-")
    case "title":
      return words.map(cap).join(" ")
    default:
      throw new TextError("Style must be camel, snake, kebab, or title")
  }
}

export async function base64(args: { text?: string; decode?: boolean }): Promise<string> {
  const text = (args.text ?? "")
  if (!text) throw new TextError("Provide input text")
  try {
    if (args.decode) {
      const out = Buffer.from(text, "base64").toString("utf-8")
      if (!out && text.trim()) throw new Error("invalid")
      return `Decoded: ${out}`
    }
    return `Encoded: ${Buffer.from(text, "utf-8").toString("base64")}`
  } catch {
    throw new TextError("Invalid base64 input")
  }
}
