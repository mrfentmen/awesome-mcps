import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { details } from "./api.js"
import { recent } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "medrxiv-mcp", version: "1.0.0" })
  server.registerTool(
    "details",
    {
      title: "Details",
      description: "Get preprint details.",
      inputSchema: z.object( { doi: z.string().describe("medRxiv DOI.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await details(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "recent",
    {
      title: "Recent",
      description: "Recent preprints.",
      inputSchema: z.object( { limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await recent(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
