import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { candidates } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "fec-mcp", version: "1.0.0" })
  server.registerTool(
    "candidates",
    {
      title: "Candidates",
      description: "Search federal candidates.",
      inputSchema: z.object( { query: z.string().describe("Candidate name."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await candidates(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
