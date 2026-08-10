import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { convert } from "./api.js"
import { listUnits } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "unit-converter-mcp", version: "1.0.0" })
  server.tool("convert", "Convert a value between units.", { value: z.number().describe("The value to convert."), from: z.string().describe("Source unit."), to: z.string().describe("Target unit.") }, async (args) => {
    try { return text(await convert(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("list_units", "List available units for a category.", { category: z.string().describe("length, weight, temperature, speed, or data.").optional() }, async (args) => {
    try { return text(await listUnits(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
