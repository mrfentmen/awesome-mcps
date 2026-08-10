import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { album } from "./api.js"
import { artist } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "theaudiodb-mcp", version: "1.0.0" })
  server.tool("artist", "Search artists by name.", { name: z.string().describe("Artist name.") }, async (args) => {
    try { return text(await artist(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("album", "Albums by artist.", { artist: z.string().describe("Artist name.") }, async (args) => {
    try { return text(await album(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
