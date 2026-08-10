import QRCode from "qrcode"
import { writeFileSync, mkdtempSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

export class QrError extends Error {}

export async function generateQr(args: { text?: string; size?: number; filename?: string }): Promise<string> {
  const text = args.text ?? ""
  if (!text) throw new QrError("Provide text or a URL to encode")
  const size = Math.min(Math.max(args.size ?? 512, 128), 2048)
  const safe = /^[\w.\- ]+$/.test(args.filename ?? "") && args.filename!.endsWith(".png")
    ? args.filename!
    : `qr-${Date.now()}.png`
  const dir = mkdtempSync(join(tmpdir(), "qr-"))
  const path = join(dir, safe)
  const png = await QRCode.toBuffer(text, { width: size, margin: 1, errorCorrectionLevel: "M" })
  writeFileSync(path, png)
  return `Created ${path} (${png.length} bytes, ${size}x${size})`
}
