import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { books } from "./api.js"
import { chapters } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "lotr-mcp", version: "1.0.0" })
  server.tool("books", "List the Lord of the Rings books.", {  }, async (args) => {
    try { return text(await books(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("chapters", "Chapters for a book.", { bookId: z.string().describe("Book ID.") }, async (args) => {
    try { return text(await chapters(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
