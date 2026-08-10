import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"

export class HashError extends Error {}

function algo(name: string): string {
  const a = (name ?? "sha256").toLowerCase()
  if (!["sha256", "sha1", "md5", "sha512"].includes(a)) throw new HashError("Use sha256, sha512, sha1, or md5")
  return a
}

export async function hashText(args: { text?: string; algorithm?: string }): Promise<string> {
  const text = args.text ?? ""
  if (!text) throw new HashError("Provide text to hash")
  const a = algo(args.algorithm ?? "sha256")
  return `${a}: ${createHash(a).update(text, "utf8").digest("hex")}`
}

export async function hashFile(args: { path?: string; algorithm?: string }): Promise<string> {
  const path = args.path ?? ""
  if (!path) throw new HashError("Provide a file path")
  const a = algo(args.algorithm ?? "sha256")
  const data = readFileSync(path)
  return `${a}: ${createHash(a).update(data).digest("hex")} (${data.length} bytes)`
}
