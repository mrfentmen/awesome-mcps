import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { agencies } from "./api.js"
import { predictions } from "./api.js"
import { routes } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "nextbus-mcp", version: "1.0.0" })
  server.tool("agencies", "List transit agencies.", {  }, async (args) => {
    try { return text(await agencies(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("routes", "List routes for an agency.", { agency: z.string().describe("Agency tag.") }, async (args) => {
    try { return text(await routes(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("predictions", "Get arrival predictions for a stop.", { agency: z.string().describe("Agency tag."), stop: z.string().describe("Stop id."), route: z.string().describe("Route tag.").optional() }, async (args) => {
    try { return text(await predictions(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
