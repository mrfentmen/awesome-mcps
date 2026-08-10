import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { inspectUrl } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "http-inspector-mcp", version: "1.0.0" })
  server.tool("inspect_url", "Fetch a URL and report status and headers.", { url: z.string().describe("The URL to inspect.") }, async (args) => {
    try { return text(await inspectUrl(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
