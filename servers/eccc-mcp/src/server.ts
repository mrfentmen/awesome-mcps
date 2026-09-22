import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import {
  errorMessage,
  listCollections,
  getCollection,
  queryCollection,
} from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "eccc-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "list_collections",
    {
      title: "List collections",
      description: "All MSC GeoMet collections: weather, climate, water datasets and products.",
      inputSchema: z.object({
      }),
      annotations: READ_ONLY,
    },
    async ({  }) => {
      try {
        return text(await listCollections());
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "get_collection",
    {
      title: "Get collection info",
      description: "Metadata for one GeoMet collection: description, links, extent.",
      inputSchema: z.object({
        collectionId: z.string().describe("Collection id from list_collections"),
      }),
      annotations: READ_ONLY,
    },
    async ({ collectionId }) => {
      try {
        return text(await getCollection(collectionId));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "query_collection",
    {
      title: "Query collection items",
      description: "Query items in a GeoMet collection with optional bounding box.",
      inputSchema: z.object({
        collectionId: z.string().describe("Collection id"),
        bbox: z.string().optional().describe("Bounding box 'minlon,minlat,maxlon,maxlat'"),
        limit: z.number().default(10).describe("How many items"),
      }),
      annotations: READ_ONLY,
    },
    async ({ collectionId, bbox, limit }) => {
      try {
        return text(await queryCollection(collectionId, bbox, limit));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  return server
}
