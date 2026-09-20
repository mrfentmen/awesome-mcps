import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { locate } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "geolocation-db-mcp", version: "1.0.0" })
  server.registerTool(
    "locate",
    {
      title: "Locate",
      description: "Location for your IP or one IP.",
      inputSchema: z.object( { ip: z.string().describe("IP address.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await locate(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
