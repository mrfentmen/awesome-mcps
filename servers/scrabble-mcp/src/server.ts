import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { wordScore } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "scrabble-mcp", version: "1.0.0" })
  server.registerTool(
    "word_score",
    {
      title: "Word score",
      description: "Score a word in Scrabble.",
      inputSchema: z.object( { word: z.string().describe("The word to score.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await wordScore(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
