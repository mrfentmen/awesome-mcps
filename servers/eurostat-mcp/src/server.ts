import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { dataset } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "eurostat-mcp", version: "1.0.0" })
  server.registerTool(
    "dataset",
    {
      title: "Dataset",
      description: "Summary and values for a Eurostat dataset.",
      inputSchema: z.object( { code: z.string().describe("Dataset code like teilm020."), geo: z.string().describe("Optional country code like DE.").optional(), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await dataset(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
