import * as tls from "node:tls"

const UA = "mrfentmen-uptime-mcp/1.0 (https://github.com/mrfentmen)"
export class UptimeError extends Error {}

export async function check(args: { url?: string }): Promise<string> {
  const raw = (args.url ?? "").trim()
  if (!raw) throw new UptimeError("Provide a URL like https://example.com")
  const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    throw new UptimeError("That URL is not valid")
  }
  const started = Date.now()
  let res: Response
  try {
    res = await fetch(parsed.toString(), {
      method: "GET",
      redirect: "follow",
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(12000),
    })
  } catch (e) {
    return `DOWN | ${url}\n  ${e instanceof Error ? e.message : String(e)}`
  }
  const latency = Date.now() - started
  const lines = [
    `URL: ${url}`,
    `Status: ${res.status} ${res.statusText}`,
    `Latency: ${latency} ms`,
    `Final URL: ${res.url ?? url}`,
    `Content type: ${res.headers.get("content-type") ?? "n/a"}`,
  ]
  if (res.ok) lines.push(`State: UP`)
  else lines.push(`State: WARNING (non 2xx status)`)
  return lines.join("\n")
}

function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export async function cert(args: { host?: string }): Promise<string> {
  const host = (args.host ?? "").trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0]
  if (!host) throw new UptimeError("Provide a hostname like example.com")
  const cert = await new Promise<tls.PeerCertificate | null>((resolve) => {
    const socket = tls.connect({
      host,
      port: 443,
      servername: host,
      timeout: 12000,
      rejectUnauthorized: false,
    })
    socket.on("secureConnect", () => {
      try {
        const c = socket.getPeerCertificate()
        resolve(c && c.valid_to ? c : null)
      } catch {
        resolve(null)
      } finally {
        socket.end()
      }
    })
    socket.on("error", () => {
      resolve(null)
      socket.destroy()
    })
    socket.on("timeout", () => {
      resolve(null)
      socket.destroy()
    })
  })
  if (!cert) throw new UptimeError(`Could not get a TLS certificate for ${host}`)
  const validTo = new Date(cert.valid_to)
  const validFrom = new Date(cert.valid_from)
  const daysLeft = Math.floor((validTo.getTime() - Date.now()) / 86400000)
  const state = daysLeft < 0 ? "EXPIRED" : daysLeft < 30 ? "EXPIRING SOON" : "OK"
  const lines = [
    `Host: ${host}`,
    `Subject: ${cert.subject?.CN ?? "n/a"}`,
    `Issuer: ${cert.issuer?.O ?? cert.issuer?.CN ?? "n/a"}`,
    `Valid from: ${fmtDate(validFrom)}`,
    `Valid to: ${fmtDate(validTo)}`,
    `Days left: ${daysLeft}`,
    `State: ${state}`,
  ]
  return lines.join("\n")
}
