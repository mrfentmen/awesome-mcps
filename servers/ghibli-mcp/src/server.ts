import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { film } from "./api.js"
import { films } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "ghibli-mcp", version: "1.0.0" })
  server.tool("films", "All Studio Ghibli films.", {  }, async (args) => {
    try { return text(await films(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("film", "Details for one film.", { id: z.string().describe("Film id.") }, async (args) => {
    try { return text(await film(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
