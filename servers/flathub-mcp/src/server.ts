import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { app } from "./api.js"
import { search } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "flathub-mcp", version: "1.0.0" })
  server.tool("search", "Search Flathub apps.", { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await search(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("app", "Details for one app.", { appId: z.string().describe("App ID like org.gimp.GIMP.") }, async (args) => {
    try { return text(await app(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
