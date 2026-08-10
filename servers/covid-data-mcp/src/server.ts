import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { country } from "./api.js"
import { global } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "covid-data-mcp", version: "1.0.0" })
  server.tool("country", "COVID stats for one country.", { name: z.string().describe("Country name or code.") }, async (args) => {
    try { return text(await country(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("global", "Global COVID totals.", {  }, async (args) => {
    try { return text(await global(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
