import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js"

const UA = "mrfentmen-phone-validator-mcp/1.0"
export class PhoneError extends Error {}

export async function validate(args: { number?: string; country?: string }): Promise<string> {
  const number = (args.number ?? "").trim()
  if (!number) throw new PhoneError("Provide a phone number")
  const country = (args.country ?? "").trim().toUpperCase()
  let parsed
  try {
    parsed = country ? parsePhoneNumberFromString(number, country as CountryCode) : parsePhoneNumberFromString(number)
  } catch {
    parsed = null
  }
  if (!parsed || !parsed.isValid()) {
    return `"${number}" is not a valid phone number${country ? ` for ${country}` : ""}`
  }
  return [
    `Number: ${number}`,
    `Validity: VALID`,
    `E.164: ${parsed.number}`,
    `Country: ${parsed.country ?? "n/a"} (${parsed.countryCallingCode ? "+" + parsed.countryCallingCode : "n/a"})`,
    `Type: ${parsed.getType?.() ?? "n/a"}`,
    `National format: ${parsed.formatNational()}`,
    `International format: ${parsed.formatInternational()}`,
  ].join("\n")
}
