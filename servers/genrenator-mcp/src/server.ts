import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { genre } from "./api.js"
import { genres } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "genrenator-mcp", version: "1.0.0" })
  server.tool("genre", "Get a random genre.", {  }, async (args) => {
    try { return text(await genre(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("genres", "Get several random genres.", { count: z.number().describe("How many genres.").optional() }, async (args) => {
    try { return text(await genres(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
