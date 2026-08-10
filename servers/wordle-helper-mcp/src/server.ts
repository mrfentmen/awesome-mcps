import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { filter } from "./api.js"
import { suggest } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "wordle-helper-mcp", version: "1.0.0" })
  server.tool("suggest", "Suggest a starting guess.", {  }, async (args) => {
    try { return text(await suggest(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("filter", "Filter candidates given feedback.", { guesses: z.string().describe("JSON array of {word, marks} where marks are g, y, or x per letter.") }, async (args) => {
    try { return text(await filter(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
