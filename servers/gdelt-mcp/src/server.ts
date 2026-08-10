import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { newsByCountry } from "./api.js"
import { searchNews } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "gdelt-mcp", version: "1.0.0" })
  server.tool("search_news", "Search news articles by keyword.", { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional(), language: z.string().describe("Two letter language code.").optional() }, async (args) => {
    try { return text(await searchNews(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("news_by_country", "Search news mentioning a country or region.", { country: z.string().describe("Country or place name."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await newsByCountry(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
