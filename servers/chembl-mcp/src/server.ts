import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { molecule } from "./api.js"
import { search } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "chembl-mcp", version: "1.0.0" })
  server.tool("molecule", "Details for a ChEMBL molecule.", { id: z.string().describe("Molecule ID like CHEMBL25.") }, async (args) => {
    try { return text(await molecule(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("search", "Search molecules by name.", { query: z.string().describe("Name fragment."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await search(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
