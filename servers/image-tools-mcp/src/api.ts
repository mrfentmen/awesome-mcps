import sharp from "sharp"
import { mkdtempSync, statSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

export class ImageError extends Error {}

function outPath(name: string): string {
  const safe = /^[\w.\- ]+$/.test(name) ? name : `resized-${Date.now()}.jpg`
  return join(mkdtempSync(join(tmpdir(), "img-")), safe)
}

export async function resizeImage(args: { path?: string; width?: number; filename?: string }): Promise<string> {
  const src = args.path ?? ""
  if (!src) throw new ImageError("Provide a path to an image")
  const width = Math.min(Math.max(args.width ?? 800, 16), 8000)
  const out = outPath(args.filename ?? `resized-${Date.now()}.jpg`)
  await sharp(src).resize({ width, withoutEnlargement: true }).toFile(out)
  const size = statSync(out).size
  return `Created ${out} (${size} bytes, width ${width})`
}

export async function inspectImage(args: { path?: string }): Promise<string> {
  const src = args.path ?? ""
  if (!src) throw new ImageError("Provide a path to an image")
  const meta = await sharp(src).metadata()
  return `Format: ${meta.format}\nWidth: ${meta.width}\nHeight: ${meta.height}\nChannels: ${meta.channels}\nSize: ${(statSync(src).size / 1024).toFixed(1)} KB\nHas alpha: ${meta.hasAlpha}`
}
