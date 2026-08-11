import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { convert } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "hebcal-mcp", version: "1.0.0" })
  server.tool("convert", "Convert a Gregorian date.", { date: z.string().describe("YYYY-MM-DD.") }, async (args) => {
    try { return text(await convert(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
