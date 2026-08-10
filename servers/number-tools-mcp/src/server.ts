import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { convertBase } from "./api.js"
import { roman } from "./api.js"
import { spellNumber } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "number-tools-mcp", version: "1.0.0" })
  server.tool("convert_base", "Convert a number between bases.", { value: z.string().describe("The number as text."), from: z.number().describe("Source base 2 to 36.").optional(), to: z.number().describe("Target base 2 to 36.").optional() }, async (args) => {
    try { return text(await convertBase(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("roman", "Convert a number to or from roman numerals.", { value: z.string().describe("A number or roman numeral.") }, async (args) => {
    try { return text(await roman(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("spell_number", "Spell out a number in words.", { value: z.number().describe("Number up to 999,999.") }, async (args) => {
    try { return text(await spellNumber(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
