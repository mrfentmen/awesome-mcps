import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { quoteOfTheDay } from "./api.js"
import { randomQuote } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "quotes-mcp", version: "1.0.0" })
  server.tool("quote_of_the_day", "Get the quote of the day.", {  }, async (args) => {
    try { return text(await quoteOfTheDay(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("random_quote", "Get a random quote.", {  }, async (args) => {
    try { return text(await randomQuote(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
