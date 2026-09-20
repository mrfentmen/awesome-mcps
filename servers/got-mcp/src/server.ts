import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { book } from "./api.js"
import { character } from "./api.js"
import { houses } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "got-mcp", version: "1.0.0" })
  server.registerTool(
    "book",
    {
      title: "Book",
      description: "Get a book by id.",
      inputSchema: z.object( { id: z.number().describe("Book id.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await book(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "character",
    {
      title: "Character",
      description: "Get a character by id.",
      inputSchema: z.object( { id: z.number().describe("Character id.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await character(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "houses",
    {
      title: "Houses",
      description: "List houses.",
      inputSchema: z.object( { limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await houses(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
