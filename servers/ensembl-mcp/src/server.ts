import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { lookup } from "./api.js"
import { sequence } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "ensembl-mcp", version: "1.0.0" })
  server.tool("lookup", "Look up a gene symbol.", { species: z.string().describe("Species, e.g. human.").optional(), symbol: z.string().describe("Gene symbol.") }, async (args) => {
    try { return text(await lookup(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("sequence", "Get sequence for a stable id.", { id: z.string().describe("Stable transcript id.") }, async (args) => {
    try { return text(await sequence(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
