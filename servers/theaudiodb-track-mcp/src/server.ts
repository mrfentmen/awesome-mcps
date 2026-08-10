import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { track } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "theaudiodb-track-mcp", version: "1.0.0" })
  server.tool("track", "Details for one track by ID.", { id: z.number().describe("Track ID.") }, async (args) => {
    try { return text(await track(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
