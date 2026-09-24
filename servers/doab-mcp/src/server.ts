import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import {
  errorMessage,
  searchBooks,
  getItem,
} from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "doab-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "search_books",
    {
      title: "Search books",
      description: "Search DOAB open access books by keyword with handles and dates.",
      inputSchema: z.object({
        query: z.string().describe("Search text"),
      }),
      annotations: READ_ONLY,
    },
    async ({ query }) => {
      try {
        return text(await searchBooks(query));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "get_item",
    {
      title: "Get item by handle",
      description: "DOAB record by handle prefix and suffix, e.g. 20.500.12854 and 170275.",
      inputSchema: z.object({
        prefix: z.string().describe("Handle prefix"),
        suffix: z.string().describe("Handle suffix"),
      }),
      annotations: READ_ONLY,
    },
    async ({ prefix, suffix }) => {
      try {
        return text(await getItem(prefix, suffix));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  return server
}
