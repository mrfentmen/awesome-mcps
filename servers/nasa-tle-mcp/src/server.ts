import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { satellite } from "./api.js"
import { search } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "nasa-tle-mcp", version: "1.0.0" })
  server.tool("satellite", "Get TLE for a satellite by id.", { satid: z.number().describe("NORAD catalog id.") }, async (args) => {
    try { return text(await satellite(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("search", "Search satellites by name.", { query: z.string().describe("Name search query.") }, async (args) => {
    try { return text(await search(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
