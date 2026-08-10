import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { define } from "./api.js"
import { wordOfDay } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "dictionary-mcp", version: "1.0.0" })
  server.tool("define", "Get the definition of a word.", { word: z.string().describe("Word to look up.") }, async (args) => {
    try { return text(await define(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("word_of_day", "Get a random word with its definition.", {  }, async (args) => {
    try { return text(await wordOfDay(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
