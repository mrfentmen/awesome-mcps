import { randomInt } from "node:crypto"

export class PassError extends Error {}

const LETTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
const NUMBERS = "0123456789"
const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.?"

const WORDS = [
  "cloud", "river", "ember", "falcon", "maple", "orbit", "stone", "breeze",
  "canyon", "dolphin", "eclipse", "forest", "glacier", "horizon", "island",
  "juniper", "kelp", "lantern", "meadow", "nebula", "ocean", "peak", "quartz",
  "ridge", "summit", "tide", "uplift", "valley", "willow", "zenith",
  "aster", "boulder", "cedar", "delta", "evergreen", "foxtail", "granite",
  "harbor", "iris", "jade", "karst", "lagoon", "marble", "north", "opal",
]

export async function generatePassword(args: { length?: number; symbols?: boolean; numbers?: boolean }): Promise<string> {
  const length = Math.min(Math.max(args.length ?? 16, 8), 64)
  const useSymbols = args.symbols !== false
  const useNumbers = args.numbers !== false
  let pool = LETTERS
  if (useNumbers) pool += NUMBERS
  if (useSymbols) pool += SYMBOLS
  const bytes = new Uint8Array(length)
  let out = ""
  for (let i = 0; i < length; i++) {
    out += pool[randomInt(pool.length)]
  }
  void bytes
  return out
}

export async function passphrase(args: { words?: number }): Promise<string> {
  const n = Math.min(Math.max(args.words ?? 4, 2), 12)
  const picks: string[] = []
  for (let i = 0; i < n; i++) picks.push(WORDS[randomInt(WORDS.length)])
  return picks.join("-") + `-${randomInt(10)}${randomInt(10)}`
}
