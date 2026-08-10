import bwipjs from "bwip-js"

const UA = "mrfentmen-barcode-mcp/1.0 (https://github.com/mrfentmen)"
export class BarcodeError extends Error {}

function svg(bcid: string, text: string): string {
  try {
    return bwipjs.toSVG({ bcid, text, scale: 3, height: 12, includetext: true, textxalign: "center" })
  } catch (e) {
    throw new BarcodeError(`Barcode generation failed: ${e instanceof Error ? e.message : String(e)}`)
  }
}

export async function generateEan(args: { code?: string }): Promise<string> {
  const code = (args.code ?? "").trim()
  if (!/^\d{12,13}$/.test(code)) throw new BarcodeError("Provide a 12 or 13 digit EAN code")
  const s = await svg("ean13", code)
  return `EAN-13 barcode for ${code}:\n${s}`
}

export async function generateCode128(args: { text?: string }): Promise<string> {
  const text = (args.text ?? "").trim()
  if (!text) throw new BarcodeError("Provide text to encode")
  if (text.length > 80) throw new BarcodeError("Text is too long, keep it under 80 characters")
  const s = await svg("code128", text)
  return `Code-128 barcode for "${text}":\n${s}`
}
