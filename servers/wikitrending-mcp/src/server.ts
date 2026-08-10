import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { featured } from "./api.js"
import { mostread } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "wikitrending-mcp", version: "1.0.0" })
  server.tool("featured", "Featured article for a date.", { date: z.string().describe("Date YYYY/MM/DD, defaults to today.").optional() }, async (args) => {
    try { return text(await featured(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("mostread", "Most-read articles for a date.", { date: z.string().describe("Date YYYY/MM/DD, defaults to today.").optional(), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await mostread(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
