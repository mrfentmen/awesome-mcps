import { createHash, createHmac } from "node:crypto"

const UA = "mrfentmen-crypto-tools-mcp/1.0"
export class CryptoError extends Error {}

const ALGOS = ["md5", "sha1", "sha256", "sha512"]

export async function hash(args: { text?: string; algorithm?: string }): Promise<string> {
  const text = (args.text ?? "")
  if (!text) throw new CryptoError("Provide input text")
  const algo = (args.algorithm ?? "sha256").toLowerCase()
  if (!ALGOS.includes(algo)) throw new CryptoError(`Algorithm must be one of ${ALGOS.join(", ")}`)
  const out = createHash(algo).update(text, "utf-8").digest("hex")
  return `${algo} of "${text}":\n${out}`
}

export async function hmac(args: { text?: string; key?: string }): Promise<string> {
  const text = (args.text ?? "")
  const key = (args.key ?? "")
  if (!text || !key) throw new CryptoError("Provide both text and a secret key")
  const out = createHmac("sha256", key).update(text, "utf-8").digest("hex")
  return `HMAC-SHA256 of "${text}":\n${out}`
}
