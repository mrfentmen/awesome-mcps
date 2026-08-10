import { randomUUID } from "node:crypto"

export class UuidError extends Error {}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function generateUuid(_args: Record<string, never>): Promise<string> {
  return randomUUID()
}

export async function generateMany(args: { count?: number }): Promise<string> {
  const n = Math.min(Math.max(args.count ?? 5, 1), 100)
  return Array.from({ length: n }, () => randomUUID()).join("\n")
}

export async function validateUuid(args: { uuid?: string }): Promise<string> {
  const u = (args.uuid ?? "").trim()
  if (!u) throw new UuidError("Provide a UUID string")
  return UUID_RE.test(u) ? `${u} is a valid UUID` : `${u} is not a valid UUID`
}
