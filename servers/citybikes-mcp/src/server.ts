import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { network } from "./api.js"
import { networks } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "citybikes-mcp", version: "1.0.0" })
  server.tool("networks", "All bike share networks.", {  }, async (args) => {
    try { return text(await networks(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("network", "Live stations for one network.", { id: z.string().describe("Network ID like bixi-montreal.") }, async (args) => {
    try { return text(await network(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
