import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { get } from "./api.js"
import { headers } from "./api.js"
import { ip } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "httpbin-mcp", version: "1.0.0" })
  server.tool("get", "Send a GET request and see echo.", { path: z.string().describe("Endpoint path.") }, async (args) => {
    try { return text(await get(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("ip", "Your outbound IP.", {  }, async (args) => {
    try { return text(await ip(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("headers", "Request headers echo.", {  }, async (args) => {
    try { return text(await headers(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
