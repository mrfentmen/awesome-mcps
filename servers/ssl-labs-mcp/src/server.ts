import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { analyze } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "ssl-labs-mcp", version: "1.0.0" })
  server.tool("analyze", "Grade a host with SSL Labs.", { host: z.string().describe("Host name.") }, async (args) => {
    try { return text(await analyze(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
