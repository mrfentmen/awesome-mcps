import IBAN from "iban"

const UA = "mrfentmen-iban-validator-mcp/1.0"
const anyIBAN = IBAN as unknown as { isValid: (v: string) => boolean; printFormat: (v: string) => string; countryInfo?: Record<string, string> }
export class IbanError extends Error {}

export async function validate(args: { iban?: string }): Promise<string> {
  const value = (args.iban ?? "").trim().replace(/\s+/g, "")
  if (!value) throw new IbanError("Provide an IBAN")
  const valid = anyIBAN.isValid(value)
  const formatted = anyIBAN.printFormat(value)
  return `IBAN: ${formatted}\nValidity: ${valid ? "VALID" : "INVALID"}`
}

export async function info(args: { iban?: string }): Promise<string> {
  const value = (args.iban ?? "").trim().replace(/\s+/g, "")
  if (!value) throw new IbanError("Provide an IBAN")
  if (!anyIBAN.isValid(value)) throw new IbanError("Not a valid IBAN")
  const country = value.slice(0, 2)
  const bban = value.slice(4)
  return `IBAN: ${anyIBAN.printFormat(value)}\nCountry: ${country} (${anyIBAN.countryInfo?.[country] ?? "n/a"})\nLength: ${value.length} characters\nBBAN: ${bban}`
}
