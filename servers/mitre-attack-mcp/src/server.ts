import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { search } from "./api.js"
import { technique } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "mitre-attack-mcp", version: "1.0.0" })
  server.registerTool(
    "search",
    {
      title: "Search",
      description: "Search techniques by keyword.",
      inputSchema: z.object( { query: z.string().describe("Keyword to search, for example phishing or persistence."), limit: z.number().describe("Maximum results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await search(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "technique",
    {
      title: "Technique",
      description: "Get one technique by ID.",
      inputSchema: z.object( { id: z.string().describe("Technique ID, for example T1059.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await technique(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
