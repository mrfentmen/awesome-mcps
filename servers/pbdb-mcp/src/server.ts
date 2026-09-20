import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { occurrences } from "./api.js"
import { taxa } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "pbdb-mcp", version: "1.0.0" })
  server.registerTool(
    "occurrences",
    {
      title: "Occurrences",
      description: "Fossil occurrences for a taxon.",
      inputSchema: z.object( { taxon: z.string().describe("Taxon name like Triceratops."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await occurrences(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "taxa",
    {
      title: "Taxa",
      description: "Information about a taxon.",
      inputSchema: z.object( { name: z.string().describe("Taxon name.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await taxa(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
