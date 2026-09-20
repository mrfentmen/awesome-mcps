import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { dataset } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "cdc-data-mcp", version: "1.0.0" })
  server.registerTool(
    "dataset",
    {
      title: "Dataset",
      description: "Query a CDC Socrata dataset.",
      inputSchema: z.object( { dataset_id: z.string().describe("Socrata dataset id like 9dzk-mvmi."), limit: z.number().describe("Max rows.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await dataset(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
