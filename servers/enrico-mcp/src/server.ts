import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { countries } from "./api.js"
import { holidays } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "enrico-mcp", version: "1.0.0" })
  server.tool("countries", "List supported countries.", {  }, async (args) => {
    try { return text(await countries(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("holidays", "Public holidays for a country and year.", { country: z.string().describe("Country code like USA."), year: z.number().describe("Year.") }, async (args) => {
    try { return text(await holidays(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
