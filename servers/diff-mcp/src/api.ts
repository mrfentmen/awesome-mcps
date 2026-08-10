import { diffLines, createTwoFilesPatch } from "diff"

export class DiffError extends Error {}

export async function diffText(args: { a?: string; b?: string }): Promise<string> {
  const a = args.a ?? ""
  const b = args.b ?? ""
  const changes = diffLines(a, b)
  const out: string[] = []
  for (const c of changes) {
    const lines = c.value.split("\n").filter(Boolean)
    if (c.added) out.push(...lines.map((l) => `+ ${l}`))
    else if (c.removed) out.push(...lines.map((l) => `- ${l}`))
    else out.push(...lines.map((l) => `  ${l}`))
  }
  return out.slice(0, 200).join("\n")
}

export async function unifiedDiff(args: { a?: string; b?: string; context?: number }): Promise<string> {
  const ctx = Math.min(Math.max(args.context ?? 3, 0), 10)
  const patch = createTwoFilesPatch("original", "changed", args.a ?? "", args.b ?? "", "", "", { context: ctx })
  return patch.slice(0, 8000)
}
