const UA = "mrfentmen-meme-generator-mcp/1.0 (https://github.com/mrfentmen)"
const BASE = "https://api.imgflip.com"

export class MemeError extends Error {}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(20000) })
  if (!res.ok) throw new MemeError(`Imgflip returned HTTP ${res.status}`)
  return (await res.json()) as T
}

interface MemeTemplate {
  id: string
  name: string
  url: string
  width: number
  height: number
}

export async function templates(args: { limit?: number }): Promise<string> {
  const data = await get<{ success: boolean; data: { memes: MemeTemplate[] } }>("/get_memes")
  if (!data.success) throw new MemeError("Imgflip could not list templates")
  const limit = Math.min(args.limit ?? 15, 50)
  const list = data.data.memes.slice(0, limit)
  return list.map((m, i) => `${i + 1}. ${m.id} | ${m.name} | ${m.width}x${m.height}`).join("\n")
}

export async function caption(args: { template_id?: string; top?: string; bottom?: string }): Promise<string> {
  const id = (args.template_id ?? "").trim()
  if (!id) throw new MemeError("Provide a template ID from the templates tool")
  const top = (args.top ?? "").trim()
  const bottom = (args.bottom ?? "").trim()
  if (!top && !bottom) throw new MemeError("Provide at least one caption line")
  const params = new URLSearchParams({ template_id: id, text0: top, text1: bottom })
  const data = await get<{ success: boolean; error_message?: string; data?: { url: string } }>(`/caption_image?${params.toString()}`)
  if (!data.success || !data.data) throw new MemeError(data.error_message ?? "Caption failed")
  return `Meme ready:\n${data.data.url}`
}
