import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { previous } from "./api.js"
import { upcoming } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "launchlibrary-mcp", version: "1.0.0" })
  server.tool("upcoming", "Upcoming launches.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await upcoming(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("previous", "Previous launches.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await previous(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
