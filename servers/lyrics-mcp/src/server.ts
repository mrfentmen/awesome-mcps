import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { getLyrics } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "lyrics-mcp", version: "1.0.0" })
  server.tool("get_lyrics", "Get lyrics for an artist and song title.", { artist: z.string().describe("Artist name."), song: z.string().describe("Song title.") }, async (args) => {
    try { return text(await getLyrics(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
