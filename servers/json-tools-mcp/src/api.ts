export class JsonError extends Error {}

function parse(input: string): unknown {
  try {
    return JSON.parse(input)
  } catch (e) {
    throw new JsonError(`Invalid JSON: ${e instanceof Error ? e.message.split("\n")[0] : String(e)}`)
  }
}

export async function validateJson(args: { json?: string }): Promise<string> {
  const input = args.json ?? ""
  if (!input.trim()) throw new JsonError("Provide JSON text")
  const value = parse(input)
  return `Valid JSON\nTop level type: ${Array.isArray(value) ? "array" : typeof value}`
}

export async function formatJson(args: { json?: string; indent?: number }): Promise<string> {
  const input = args.json ?? ""
  const indent = Math.min(Math.max(args.indent ?? 2, 0), 8)
  const value = parse(input)
  return JSON.stringify(value, null, indent)
}

export async function jsonInfo(args: { json?: string }): Promise<string> {
  const input = args.json ?? ""
  const value = parse(input)
  const type = Array.isArray(value) ? "array" : typeof value
  if (Array.isArray(value)) {
    const first = value[0]
    return `Type: array\nLength: ${value.length}\nElement type: ${typeof first}${first && typeof first === "object" ? ` with ${Object.keys(first as object).length} keys` : ""}`
  }
  if (value && typeof value === "object") {
    return `Type: object\nKeys (${Object.keys(value as object).length}): ${Object.keys(value as object).slice(0, 30).join(", ")}`
  }
  return `Type: ${type}\nValue: ${String(value).slice(0, 200)}`
}
