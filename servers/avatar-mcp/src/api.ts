const BASE = "https://api.dicebear.com/9.x"
const UA = "mrfentmen-avatar-mcp/1.0 (https://github.com/mrfentmen)"
export class AvatarError extends Error {}

const STYLES = ["initials", "pixel-art", "lorelei", "bottts", "adventurer", "fun-emoji", "notionists", "thumbs"]

export async function initialsAvatar(args: { name?: string; style?: string }): Promise<string> {
  const name = (args.name ?? "").trim()
  if (!name) throw new AvatarError("Provide a name")
  const style = (args.style ?? "initials").toLowerCase()
  if (!STYLES.includes(style)) throw new AvatarError(`Style must be one of: ${STYLES.join(", ")}`)
  const res = await fetch(`${BASE}/${style}/svg?seed=${encodeURIComponent(name)}`, {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(20000),
  })
  if (!res.ok) throw new AvatarError(`DiceBear error ${res.status}`)
  const svg = await res.text()
  return `Avatar SVG for ${name} (${style}):\n${svg.slice(0, 500)}${svg.length > 500 ? "\n[...]" : ""}`
}

export async function avatarUrl(args: { name?: string; style?: string }): Promise<string> {
  const name = (args.name ?? "").trim()
  if (!name) throw new AvatarError("Provide a name")
  const style = (args.style ?? "initials").toLowerCase()
  return `${BASE}/${style}/svg?seed=${encodeURIComponent(name)}`
}
