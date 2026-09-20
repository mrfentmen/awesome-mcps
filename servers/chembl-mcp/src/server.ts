import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { molecule } from "./api.js"
import { search } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "chembl-mcp", version: "1.0.0" })
  server.registerTool(
    "molecule",
    {
      title: "Molecule",
      description: "Details for a ChEMBL molecule.",
      inputSchema: z.object( { id: z.string().describe("Molecule ID like CHEMBL25.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await molecule(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "search",
    {
      title: "Search",
      description: "Search molecules by name.",
      inputSchema: z.object( { query: z.string().describe("Name fragment."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await search(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
