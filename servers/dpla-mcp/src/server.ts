import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import {
  errorMessage,
  searchItems,
  getItem,
  searchCollections,
} from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "dpla-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "search_items",
    {
      title: "Search items",
      description: "Search DPLA's millions of photos, books, maps and recordings.",
      inputSchema: z.object({
        query: z.string().describe("Search text"),
        pageSize: z.number().default(10).describe("Results, max 500"),
      }),
      annotations: READ_ONLY,
    },
    async ({ query, pageSize }) => {
      try {
        return text(await searchItems(query, pageSize));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "get_item",
    {
      title: "Get item detail",
      description: "Full DPLA record with source links and rights info.",
      inputSchema: z.object({
        itemId: z.string().describe("Item id"),
      }),
      annotations: READ_ONLY,
    },
    async ({ itemId }) => {
      try {
        return text(await getItem(itemId));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "search_collections",
    {
      title: "Search collections",
      description: "Search DPLA partner collections and exhibitions.",
      inputSchema: z.object({
        query: z.string().describe("Search text"),
      }),
      annotations: READ_ONLY,
    },
    async ({ query }) => {
      try {
        return text(await searchCollections(query));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  return server
}
