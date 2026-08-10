import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { wordScore } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "scrabble-mcp", version: "1.0.0" })
  server.tool("word_score", "Score a word in Scrabble.", { word: z.string().describe("The word to score.") }, async (args) => {
    try { return text(await wordScore(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
