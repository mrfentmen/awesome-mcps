import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { nextLaunch } from "./api.js"
import { upcomingLaunches } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "space-launches-mcp", version: "1.0.0" })
  server.tool("upcoming_launches", "List upcoming rocket launches.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await upcomingLaunches(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("next_launch", "Get the next scheduled launch.", {  }, async (args) => {
    try { return text(await nextLaunch(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
