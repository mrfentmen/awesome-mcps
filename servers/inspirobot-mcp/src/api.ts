const UA = "mrfentmen-inspirobot-mcp/1.0 (https://github.com/mrfentmen)"

export class InspiroError extends Error {}

export async function generate(_args?: unknown): Promise<string> {
  const res = await fetch("https://inspirobot.me/api?generate=true", {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new InspiroError(`InspiroBot returned HTTP ${res.status}`)
  const url = (await res.text()).trim()
  if (!url.startsWith("http")) throw new InspiroError("InspiroBot returned an unexpected response")
  return `Generated inspirational poster:\n${url}`
}
