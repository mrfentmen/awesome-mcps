import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { listZones } from "./api.js"
import { timeInZone } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "timezone-mcp", version: "1.0.0" })
  server.tool("time_in_zone", "Get the current time in an IANA timezone.", { timezone: z.string().describe("IANA timezone like America/New_York.") }, async (args) => {
    try { return text(await timeInZone(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("list_zones", "List common IANA timezones.", {  }, async (args) => {
    try { return text(await listZones(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
