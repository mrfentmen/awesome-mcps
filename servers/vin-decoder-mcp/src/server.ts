import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { decodeVin } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "vin-decoder-mcp", version: "1.0.0" })
  server.registerTool(
    "decode_vin",
    {
      title: "Decode vin",
      description: "Decode a VIN into vehicle details.",
      inputSchema: z.object( { vin: z.string().describe("17 character VIN.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await decodeVin(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
