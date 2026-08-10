import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { occurrences } from "./api.js"
import { taxa } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "pbdb-mcp", version: "1.0.0" })
  server.tool("occurrences", "Fossil occurrences for a taxon.", { taxon: z.string().describe("Taxon name like Triceratops."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await occurrences(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("taxa", "Information about a taxon.", { name: z.string().describe("Taxon name.") }, async (args) => {
    try { return text(await taxa(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
