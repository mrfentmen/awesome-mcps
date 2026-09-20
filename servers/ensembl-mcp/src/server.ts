import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { lookup } from "./api.js"
import { sequence } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "ensembl-mcp", version: "1.0.0" })
  server.registerTool(
    "lookup",
    {
      title: "Lookup",
      description: "Look up a gene symbol.",
      inputSchema: z.object( { species: z.string().describe("Species, e.g. human.").optional(), symbol: z.string().describe("Gene symbol.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await lookup(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "sequence",
    {
      title: "Sequence",
      description: "Get sequence for a stable id.",
      inputSchema: z.object( { id: z.string().describe("Stable transcript id.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await sequence(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
