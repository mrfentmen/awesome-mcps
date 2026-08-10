import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { drivers } from "./api.js"
import { races } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "openf1-mcp", version: "1.0.0" })
  server.tool("races", "List races for a season.", { year: z.number().describe("Season year.").optional() }, async (args) => {
    try { return text(await races(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("drivers", "List drivers for a session.", { session: z.number().describe("Session key.").optional(), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await drivers(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
