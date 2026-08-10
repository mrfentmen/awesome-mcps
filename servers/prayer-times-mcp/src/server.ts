import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { timings } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "prayer-times-mcp", version: "1.0.0" })
  server.tool("timings", "Prayer times for a city.", { city: z.string().describe("City name."), country: z.string().describe("Country name.") }, async (args) => {
    try { return text(await timings(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
