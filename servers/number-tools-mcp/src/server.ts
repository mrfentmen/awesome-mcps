import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { convertBase } from "./api.js"
import { roman } from "./api.js"
import { spellNumber } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "number-tools-mcp", version: "1.0.0" })
  server.registerTool(
    "convert_base",
    {
      title: "Convert base",
      description: "Convert a number between bases.",
      inputSchema: z.object( { value: z.string().describe("The number as text."), from: z.number().describe("Source base 2 to 36.").optional(), to: z.number().describe("Target base 2 to 36.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await convertBase(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "roman",
    {
      title: "Roman",
      description: "Convert a number to or from roman numerals.",
      inputSchema: z.object( { value: z.string().describe("A number or roman numeral.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await roman(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "spell_number",
    {
      title: "Spell number",
      description: "Spell out a number in words.",
      inputSchema: z.object( { value: z.number().describe("Number up to 999,999.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await spellNumber(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
