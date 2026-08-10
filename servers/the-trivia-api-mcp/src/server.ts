import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { questions } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "the-trivia-api-mcp", version: "1.0.0" })
  server.tool("questions", "Random trivia questions.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await questions(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
