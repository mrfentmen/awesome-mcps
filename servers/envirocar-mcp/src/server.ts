import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { sensors } from "./api.js"
import { trackDetail } from "./api.js"
import { tracks } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "envirocar-mcp", version: "1.0.0" })
  server.tool("tracks", "List recent tracks.", { limit: z.number().describe("Max tracks.").optional() }, async (args) => {
    try { return text(await tracks(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("track_detail", "Get a track by id.", { id: z.string().describe("Track id.") }, async (args) => {
    try { return text(await trackDetail(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("sensors", "List available sensor definitions.", {  }, async (args) => {
    try { return text(await sensors(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
