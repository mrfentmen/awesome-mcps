import zxcvbn from "zxcvbn"

const UA = "mrfentmen-password-strength-mcp/1.0"
export class PasswordError extends Error {}

export async function checkPassword(args: { password?: string }): Promise<string> {
  const password = (args.password ?? "").trim()
  if (!password) throw new PasswordError("Provide a password to check")
  const r = zxcvbn(password)
  const labels = ["very weak", "weak", "fair", "strong", "very strong"]
  const crack = r.crack_times_display?.offline_slow_hashing_1e4_per_second ?? "n/a"
  const lines = [
    `Score: ${r.score}/4 (${labels[r.score] ?? "unknown"})`,
    `Estimated time to crack (offline, slow): ${crack}`,
    `Guesses: ${r.guesses?.toLocaleString() ?? "n/a"}`,
  ]
  if (r.feedback?.warning) lines.push(`Warning: ${r.feedback.warning}`)
  if (r.feedback?.suggestions?.length) lines.push(`Suggestions: ${r.feedback.suggestions.slice(0, 3).join("; ")}`)
  return lines.join("\n")
}
