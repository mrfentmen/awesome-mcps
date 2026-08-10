const UA = "mrfentmen-number-tools-mcp/1.0"
export class NumberError extends Error {}

export async function convertBase(args: { value?: string; from?: number; to?: number }): Promise<string> {
  const value = (args.value ?? "").trim()
  if (!value) throw new NumberError("Provide a number as text")
  const from = Math.min(Math.max(args.from ?? 10, 2), 36)
  const to = Math.min(Math.max(args.to ?? 10, 2), 36)
  try {
    const decimal = parseInt(value, from)
    if (Number.isNaN(decimal)) throw new Error("invalid")
    const negative = decimal < 0
    const abs = Math.abs(decimal)
    const out = negative ? "-" + abs.toString(to) : abs.toString(to)
    return `${value} (base ${from}) = ${out} (base ${to})`
  } catch {
    throw new NumberError(`Invalid number for base ${from}`)
  }
}

const ROMAN: Array<[number, string]> = [
  [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
  [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
]

function toRoman(n: number): string {
  let out = ""
  let v = n
  for (const [num, sym] of ROMAN) {
    while (v >= num) { out += sym; v -= num }
  }
  return out
}

function fromRoman(s: string): number {
  const map: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 }
  let total = 0
  for (let i = 0; i < s.length; i++) {
    const cur = map[s[i]] ?? 0
    const next = map[s[i + 1]] ?? 0
    total += cur < next ? -cur : cur
  }
  return total
}

export async function roman(args: { value?: string }): Promise<string> {
  const value = (args.value ?? "").trim()
  if (!value) throw new NumberError("Provide a number or roman numeral")
  if (/^[0-9]+$/.test(value)) {
    const n = parseInt(value, 10)
    if (n < 1 || n > 3999) throw new NumberError("Only 1 to 3999 supported")
    return `${n} = ${toRoman(n)}`
  }
  if (/^[IVXLCDM]+$/.test(value.toUpperCase())) {
    const n = fromRoman(value.toUpperCase())
    if (n < 1 || n > 3999) throw new NumberError("Invalid roman numeral")
    return `${value.toUpperCase()} = ${n}`
  }
  throw new NumberError("Provide a number or a valid roman numeral")
}

const ONES = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"]
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"]

function three(n: number): string {
  const parts: string[] = []
  if (n >= 100) parts.push(ONES[Math.floor(n / 100)] + " hundred")
  const rest = n % 100
  if (rest >= 20) {
    const t = TENS[Math.floor(rest / 10)]
    const o = ONES[rest % 10]
    parts.push(o ? `${t} ${o}` : t)
  } else if (rest > 0) {
    parts.push(ONES[rest])
  }
  return parts.join(" ")
}

export async function spellNumber(args: { value?: number }): Promise<string> {
  const n = args.value
  if (n === undefined || !Number.isInteger(n) || Math.abs(n) > 999999) {
    throw new NumberError("Provide an integer up to 999,999")
  }
  if (n === 0) return "0 = zero"
  const sign = n < 0 ? "negative " : ""
  const abs = Math.abs(n)
  const thousands = Math.floor(abs / 1000)
  const remainder = abs % 1000
  let words = sign
  if (thousands) words += three(thousands) + " thousand"
  if (thousands && remainder) words += " "
  if (remainder) words += three(remainder)
  return `${n} = ${words}`
}
