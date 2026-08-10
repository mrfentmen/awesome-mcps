import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { group } from "./api.js"
import { satellite } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "celestrak-mcp", version: "1.0.0" })
  server.tool("group", "Satellites in a named group.", { group: z.string().describe("Group like stations, visual, or active.").optional(), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await group(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("satellite", "One satellite by NORAD catalog number.", { noradId: z.number().describe("NORAD catalog number.") }, async (args) => {
    try { return text(await satellite(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
