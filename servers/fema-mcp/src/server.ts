import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { declarations } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "fema-mcp", version: "1.0.0" })
  server.registerTool(
    "declarations",
    {
      title: "Declarations",
      description: "Disaster declarations for a state.",
      inputSchema: z.object( { state: z.string().describe("State code like CA."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await declarations(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
