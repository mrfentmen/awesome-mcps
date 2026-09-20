import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { network } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "string-db-mcp", version: "1.0.0" })
  server.registerTool(
    "network",
    {
      title: "Network",
      description: "Interaction partners for a protein.",
      inputSchema: z.object( { proteins: z.string().describe("Comma separated gene names."), species: z.number().describe("NCBI tax id like 9606.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await network(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
