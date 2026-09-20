import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { byAuthor } from "./api.js"
import { randomPoem } from "./api.js"
import { searchTitles } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "poetry-mcp", version: "1.0.0" })
  server.registerTool(
    "search_titles",
    {
      title: "Search titles",
      description: "Search poems by title.",
      inputSchema: z.object( { title: z.string().describe("Poem title."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await searchTitles(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "by_author",
    {
      title: "By author",
      description: "List poems by an author.",
      inputSchema: z.object( { author: z.string().describe("Author name."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await byAuthor(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "random_poem",
    {
      title: "Random poem",
      description: "Get a random poem.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await randomPoem(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
