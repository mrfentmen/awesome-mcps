import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { search } from "./api.js"
import { technique } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "mitre-attack-mcp", version: "1.0.0" })
  server.tool("search", "Search techniques by keyword.", { query: z.string().describe("Keyword to search, for example phishing or persistence."), limit: z.number().describe("Maximum results.").optional() }, async (args) => {
    try { return text(await search(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("technique", "Get one technique by ID.", { id: z.string().describe("Technique ID, for example T1059.") }, async (args) => {
    try { return text(await technique(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
