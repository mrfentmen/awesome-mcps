import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { cities } from "./api.js"
import { forecast } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "ipma-mcp", version: "1.0.0" })
  server.tool("cities", "List forecast cities.", {  }, async (args) => {
    try { return text(await cities(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("forecast", "Daily forecast for a city.", { id: z.number().describe("City global id."), limit: z.number().describe("Max days.").optional() }, async (args) => {
    try { return text(await forecast(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
