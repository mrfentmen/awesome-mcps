import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { entry } from "./api.js"
import { search } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "rcsb-pdb-mcp", version: "1.0.0" })
  server.tool("entry", "Metadata for one PDB entry.", { id: z.string().describe("PDB ID like 4hhb.") }, async (args) => {
    try { return text(await entry(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("search", "Search the PDB by text.", { query: z.string().describe("Text like hemoglobin."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await search(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
