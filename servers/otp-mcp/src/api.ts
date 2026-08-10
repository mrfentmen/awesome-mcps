import { createHmac } from "node:crypto"

export class OtpError extends Error {}

function base32decode(s: string): Buffer {
  const clean = s.toUpperCase().replace(/=+$/, "").replace(/\s/g, "")
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
  let bits = ""
  for (const c of clean) {
    const v = alphabet.indexOf(c)
    if (v < 0) throw new OtpError("Secret must be valid base32")
    bits += v.toString(2).padStart(5, "0")
  }
  const bytes: number[] = []
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2))
  return Buffer.from(bytes)
}

function hotp(secret: string, counter: number, digits = 6): string {
  const key = base32decode(secret)
  const buf = Buffer.alloc(8)
  buf.writeBigUInt64BE(BigInt(counter))
  const hmac = createHmac("sha1", key).update(buf).digest()
  const offset = hmac[hmac.length - 1] & 0x0f
  const bin = ((hmac[offset] & 0x7f) << 24) | (hmac[offset + 1] << 16) | (hmac[offset + 2] << 8) | hmac[offset + 3]
  return String(bin % Math.pow(10, digits)).padStart(digits, "0")
}

export async function generateTotp(args: { secret?: string }): Promise<string> {
  const secret = (args.secret ?? "").trim()
  if (!secret) throw new OtpError("Provide a base32 secret")
  const counter = Math.floor(Date.now() / 30000)
  const code = hotp(secret, counter)
  const remaining = 30 - Math.floor((Date.now() / 1000) % 30)
  return `TOTP: ${code}\nSeconds remaining: ${remaining}`
}

export async function generateHotp(args: { secret?: string; counter?: number }): Promise<string> {
  const secret = (args.secret ?? "").trim()
  if (!secret) throw new OtpError("Provide a base32 secret")
  const counter = args.counter ?? 0
  if (counter < 0) throw new OtpError("Counter must be non negative")
  return `HOTP: ${hotp(secret, counter)}\nCounter: ${counter}`
}
