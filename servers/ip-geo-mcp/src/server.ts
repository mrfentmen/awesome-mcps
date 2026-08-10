import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { lookup } from "./api.js"
import { myIp } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "ip-geo-mcp", version: "1.0.0" })
  server.tool("lookup", "Geolocate an IP address.", { ip: z.string().describe("IP address to look up.") }, async (args) => {
    try { return text(await lookup(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("my_ip", "Geolocate the current machine public IP.", {  }, async (args) => {
    try { return text(await myIp(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
