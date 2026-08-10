import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { pluginInfo } from "./api.js"
import { searchPlugins } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "wordpress-plugins-mcp", version: "1.0.0" })
  server.tool("plugin_info", "Get details for a WordPress plugin.", { slug: z.string().describe("Plugin slug.") }, async (args) => {
    try { return text(await pluginInfo(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("search_plugins", "Search plugins.", { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await searchPlugins(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
