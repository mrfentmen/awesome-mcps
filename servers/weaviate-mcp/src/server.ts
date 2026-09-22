import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { formatObject, graphqlQuery, listClasses, listObjects, WeaviateError } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "weaviate-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "list_classes",
    {
      title: "List collections",
      description: "Weaviate collections with property names. Set WEAVIATE_URL for non-default hosts.",
      inputSchema: z.object({}),
      annotations: READ_ONLY,
    },
    async () => {
      try {
        const rows = await listClasses()
        if (rows.length === 0) return text("No collections.")
        return text(rows.map((c, i) => `${i + 1}. ${c.name} (${c.properties.join(", ") || "no props"})`).join("\n"))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "list_objects",
    {
      title: "List objects",
      description: "Objects of one collection with their properties.",
      inputSchema: z.object({
        class: z.string().describe("Collection name, e.g. 'Article'"),
        limit: z.number().int().min(1).max(100).default(5),
      }),
      annotations: READ_ONLY,
    },
    async ({ class: cls, limit }) => {
      try {
        const rows = await listObjects(cls, limit)
        if (rows.length === 0) return text(`No objects in ${cls}.`)
        return text(rows.map((o, i) => formatObject(o, i)).join("\n"))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "graphql_query",
    {
      title: "GraphQL search",
      description: "Raw Weaviate Get {} GraphQL query for semantic search. Mutations are refused.",
      inputSchema: z.object({
        query: z.string().describe("Get query, e.g. '{ Get: { Article(limit: 3) { title } } }'"),
      }),
      annotations: READ_ONLY,
    },
    async ({ query }) => {
      try {
        return text(JSON.stringify(await graphqlQuery(query)).slice(0, 2000))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof WeaviateError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
