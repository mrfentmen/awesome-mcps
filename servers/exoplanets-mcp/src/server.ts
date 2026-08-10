import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { byName } from "./api.js"
import { recent } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "exoplanets-mcp", version: "1.0.0" })
  server.tool("recent", "Recently confirmed exoplanets.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await recent(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("by_name", "Look up an exoplanet by name.", { name: z.string().describe("Planet name.") }, async (args) => {
    try { return text(await byName(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
