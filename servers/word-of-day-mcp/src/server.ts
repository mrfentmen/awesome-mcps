import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { randomWord } from "./api.js"
import { wordOfTheDay } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "word-of-day-mcp", version: "1.0.0" })
  server.tool("word_of_the_day", "Get the featured word of the day.", {  }, async (args) => {
    try { return text(await wordOfTheDay(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("random_word", "Get a random word with its definition.", {  }, async (args) => {
    try { return text(await randomWord(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
