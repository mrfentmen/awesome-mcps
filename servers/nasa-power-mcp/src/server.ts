import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { daily } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "nasa-power-mcp", version: "1.0.0" })
  server.registerTool(
    "daily",
    {
      title: "Daily",
      description: "Daily solar and weather values for a point.",
      inputSchema: z.object( { latitude: z.number().describe("Latitude."), longitude: z.number().describe("Longitude."), parameters: z.string().describe("Comma separated parameters like T2M,PRECTOTCORR.").optional(), start: z.string().describe("Start date YYYYMMDD.").optional(), end: z.string().describe("End date YYYYMMDD.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await daily(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
