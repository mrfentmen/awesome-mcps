import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { books } from "./api.js"
import { chapters } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "lotr-mcp", version: "1.0.0" })
  server.registerTool(
    "books",
    {
      title: "Books",
      description: "List the Lord of the Rings books.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await books(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "chapters",
    {
      title: "Chapters",
      description: "Chapters for a book.",
      inputSchema: z.object( { bookId: z.string().describe("Book ID.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await chapters(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
