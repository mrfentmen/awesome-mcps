import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { oa } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "unpaywall-mcp", version: "1.0.0" })
  server.registerTool(
    "oa",
    {
      title: "Oa",
      description: "Find open access for a DOI.",
      inputSchema: z.object( { doi: z.string().describe("DOI."), email: z.string().describe("Email for the API.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await oa(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
