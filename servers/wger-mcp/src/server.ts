import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { exercise } from "./api.js"
import { exercises } from "./api.js"
import { muscles } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "wger-mcp", version: "1.0.0" })
  server.tool("exercises", "List exercises with filters.", { language: z.number().describe("Language ID, 2 is English.").optional(), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await exercises(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("exercise", "Details for one exercise.", { id: z.number().describe("Exercise ID.") }, async (args) => {
    try { return text(await exercise(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("muscles", "List muscles.", {  }, async (args) => {
    try { return text(await muscles(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
