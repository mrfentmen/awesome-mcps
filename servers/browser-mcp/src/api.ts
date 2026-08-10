import { spawn, ChildProcess } from "node:child_process"
import { mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { randomUUID } from "node:crypto"

export class BrowserError extends Error {}

function findChrome(): string {
  const candidates = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
  ].filter(Boolean) as string[]
  for (const c of candidates) {
    if (existsSync(c)) return c
  }
  throw new BrowserError("Chrome not found. Install Chrome or set CHROME_PATH.")
}

interface CdpTarget {
  id: string
  type: string
  title: string
  url: string
  webSocketDebuggerUrl?: string
}

interface Pending {
  resolve: (v: any) => void
  reject: (e: Error) => void
}

class CdpSession {
  private ws?: WebSocket
  private seq = 0
  private pending = new Map<number, Pending>()
  constructor(private url: string) {}

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url)
      this.ws.onopen = () => resolve()
      this.ws.onerror = (e: any) => reject(new BrowserError(`CDP connect failed: ${e?.message ?? "unknown"}`))
      this.ws.onmessage = (ev) => {
        const msg = JSON.parse(ev.data as string)
        if (msg.id && this.pending.has(msg.id)) {
          const { resolve, reject } = this.pending.get(msg.id)!
          this.pending.delete(msg.id)
          if (msg.error) reject(new BrowserError(msg.error.message))
          else resolve(msg.result)
        }
      }
    })
  }

  send(method: string, params: Record<string, unknown> = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = ++this.seq
      this.pending.set(id, { resolve, reject })
      this.ws?.send(JSON.stringify({ id, method, params }))
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id)
          reject(new BrowserError(`CDP timeout on ${method}`))
        }
      }, 30000)
    })
  }

  close() {
    try { this.ws?.close() } catch { /* ignore */ }
  }
}

interface Page {
  child: ChildProcess
  profile: string
  port: string
  session: CdpSession
}

async function launch(): Promise<Page> {
  const chrome = findChrome()
  const profile = mkdtempSync(join(tmpdir(), "browser-mcp-"))
  const child = spawn(chrome, [
    "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
    "--disable-extensions", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank",
  ], { stdio: "ignore" })
  const portFile = join(profile, "DevToolsActivePort")
  let port = ""
  for (let i = 0; i < 50; i++) {
    await new Promise((r) => setTimeout(r, 200))
    if (existsSync(portFile)) {
      try { port = readFileSync(portFile, "utf8").split("\n")[0].trim(); break } catch { /* retry */ }
    }
  }
  if (!port) throw new BrowserError("Chrome did not open a debugging port")
  let wsUrl = ""
  for (let i = 0; i < 50 && !wsUrl; i++) {
    await new Promise((r) => setTimeout(r, 200))
    try {
      const targets = (await fetch(`http://127.0.0.1:${port}/json/list`, { signal: AbortSignal.timeout(10000) }).then((r) => r.json())) as CdpTarget[]
      const page = targets.find((t) => t.type === "page")
      wsUrl = page?.webSocketDebuggerUrl ?? ""
    } catch {
      /* Chrome still starting */
    }
  }
  if (!wsUrl) throw new BrowserError("Chrome opened no page target for CDP")
  const session = new CdpSession(wsUrl)
  await session.connect()
  return { child, profile, port, session }
}

function cleanup(page: Page) {
  try { page.session.close() } catch { /* ignore */ }
  try { page.child.kill("SIGKILL") } catch { /* ignore */ }
  try { rmSync(page.profile, { recursive: true, force: true }) } catch { /* ignore */ }
}

async function navigate(page: Page, url: string): Promise<void> {
  await page.session.send("Page.enable")
  const load = new Promise<void>((resolve) => {
    const started = Date.now()
    const timer = setInterval(async () => {
      try {
        const res = await page.session.send("Runtime.evaluate", { expression: "document.readyState", returnByValue: true })
        if (res?.result?.value === "complete" || Date.now() - started > 25000) {
          clearInterval(timer)
          resolve()
        }
      } catch {
        clearInterval(timer)
        resolve()
      }
    }, 400)
  })
  await page.session.send("Page.navigate", { url })
  await load
}

async function evalJs(page: Page, expression: string): Promise<string> {
  const res = await page.session.send("Runtime.evaluate", { expression, returnByValue: true })
  return res?.result?.value ?? ""
}

export async function openPage(args: { url?: string }): Promise<string> {
  const url = args.url ?? ""
  if (!/^https?:\/\//i.test(url)) throw new BrowserError("Provide a full http or https URL")
  const page = await launch()
  try {
    await navigate(page, url)
    const title = await evalJs(page, "document.title")
    const text = await evalJs(page, "(document.body ? document.body.innerText : '').slice(0, 3000)")
    const finalUrl = await evalJs(page, "location.href")
    return `Title: ${title || "(no title)"}\nURL: ${finalUrl}\n\n${text.slice(0, 3000)}`
  } finally {
    cleanup(page)
  }
}

export async function screenshotPage(args: { url?: string }): Promise<string> {
  const url = args.url ?? ""
  if (!/^https?:\/\//i.test(url)) throw new BrowserError("Provide a full http or https URL")
  const page = await launch()
  try {
    await navigate(page, url)
    const shot = await page.session.send("Page.captureScreenshot", { format: "png" })
    const b64: string = shot?.data ?? ""
    if (!b64) throw new BrowserError("No screenshot data returned")
    const out = join(tmpdir(), `browser-mcp-shot-${randomUUID().slice(0, 8)}.png`)
    writeFileSync(out, Buffer.from(b64, "base64"))
    return `Saved screenshot to ${out} (${Buffer.from(b64, "base64").length} bytes)`
  } finally {
    cleanup(page)
  }
}
