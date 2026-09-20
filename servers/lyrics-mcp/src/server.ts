import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { getLyrics } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "lyrics-mcp", version: "1.0.0" })
  server.registerTool(
    "get_lyrics",
    {
      title: "Get lyrics",
      description: "Get lyrics for an artist and song title.",
      inputSchema: z.object( { artist: z.string().describe("Artist name."), song: z.string().describe("Song title.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await getLyrics(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
