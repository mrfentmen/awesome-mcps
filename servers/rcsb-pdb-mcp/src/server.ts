import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { entry } from "./api.js"
import { search } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "rcsb-pdb-mcp", version: "1.0.0" })
  server.registerTool(
    "entry",
    {
      title: "Entry",
      description: "Metadata for one PDB entry.",
      inputSchema: z.object( { id: z.string().describe("PDB ID like 4hhb.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await entry(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "search",
    {
      title: "Search",
      description: "Search the PDB by text.",
      inputSchema: z.object( { query: z.string().describe("Text like hemoglobin."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await search(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
