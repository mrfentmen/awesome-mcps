import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { country } from "./api.js"
import { rates } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "vatcomply-mcp", version: "1.0.0" })
  server.tool("rates", "Current VAT rates.", {  }, async (args) => {
    try { return text(await rates(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("country", "VAT details for a country.", { code: z.string().describe("ISO country code like DE.") }, async (args) => {
    try { return text(await country(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
