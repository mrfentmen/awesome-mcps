import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { packageInfo } from "./api.js"
import { searchPackages } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "packagist-mcp", version: "1.0.0" })
  server.tool("package_info", "Get details for a PHP package.", { name: z.string().describe("Package name like laravel/framework.") }, async (args) => {
    try { return text(await packageInfo(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("search_packages", "Search packages.", { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await searchPackages(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
