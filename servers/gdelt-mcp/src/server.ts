import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { newsByCountry } from "./api.js"
import { searchNews } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "gdelt-mcp", version: "1.0.0" })
  server.registerTool(
    "search_news",
    {
      title: "Search news",
      description: "Search news articles by keyword.",
      inputSchema: z.object( { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional(), language: z.string().describe("Two letter language code.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await searchNews(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "news_by_country",
    {
      title: "News by country",
      description: "Search news mentioning a country or region.",
      inputSchema: z.object( { country: z.string().describe("Country or place name."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await newsByCountry(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
