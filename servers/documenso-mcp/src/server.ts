import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { DocumensoError, formatDocument, getDocument, listDocuments } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "documenso-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "list_documents",
    {
      title: "List documents",
      description: "Signing documents with titles and statuses.",
      inputSchema: z.object({
        limit: z.number().int().min(1).max(100).default(10),
      }),
      annotations: READ_ONLY,
    },
    async ({ limit }) => {
      try {
        const rows = await listDocuments(limit)
        if (rows.length === 0) return text("No documents.")
        return text(rows.map((d, i) => formatDocument(d, i)).join("\n"))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "get_document",
    {
      title: "Get document",
      description: "One document with recipients and signing states.",
      inputSchema: z.object({
        id: z.string().describe("Document id (use list_documents)"),
      }),
      annotations: READ_ONLY,
    },
    async ({ id }) => {
      try {
        return text(formatDocument(await getDocument(id)))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof DocumensoError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
