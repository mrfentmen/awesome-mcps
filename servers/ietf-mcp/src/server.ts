import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { format, getDocument, listMeetings, searchDocuments, searchGroups } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const errorText = (error: unknown) => text(`Error: ${error instanceof Error ? error.message : String(error)}`)

export function createServer() {
  const server = new McpServer({ name: "ietf-mcp", version: "1.0.0" })
  server.registerTool(
    "search_documents",
    {
      title: "Search documents",
      description: "Find IETF documents using the Datatracker name filter, with bounded pagination.",
      inputSchema: z.object( { query: z.string().min(1).max(120), limit: z.number().int().min(1).max(25).default(10), offset: z.number().int().min(0).max(1000).default(0) }),
      annotations: READ_ONLY,
    },
    async ({ query, limit, offset }) => {
    try { return text(format(await searchDocuments(query, limit, offset))) } catch (error) { return errorText(error) }
  }
  )
  server.registerTool(
    "get_document",
    {
      title: "Get document",
      description: "Look up an IETF document by name, such as rfc9110 or draft-ietf-httpbis.",
      inputSchema: z.object( { name: z.string().min(1).max(120) }),
      annotations: READ_ONLY,
    },
    async ({ name }) => {
    try { return text(format(await getDocument(name))) } catch (error) { return errorText(error) }
  }
  )
  server.registerTool(
    "search_working_groups",
    {
      title: "Search working groups",
      description: "Search IETF working groups by name.",
      inputSchema: z.object( { query: z.string().min(1).max(100), limit: z.number().int().min(1).max(25).default(10) }),
      annotations: READ_ONLY,
    },
    async ({ query, limit }) => {
    try { return text(format(await searchGroups(query, limit))) } catch (error) { return errorText(error) }
  }
  )
  server.registerTool(
    "list_recent_meetings",
    {
      title: "List recent meetings",
      description: "List recent IETF meetings from the public Datatracker.",
      inputSchema: z.object( { limit: z.number().int().min(1).max(25).default(10) }),
      annotations: READ_ONLY,
    },
    async ({ limit }) => {
    try { return text(format(await listMeetings(limit))) } catch (error) { return errorText(error) }
  }
  )
  return server
}
