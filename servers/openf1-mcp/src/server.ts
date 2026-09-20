import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { drivers } from "./api.js"
import { races } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "openf1-mcp", version: "1.0.0" })
  server.registerTool(
    "races",
    {
      title: "Races",
      description: "List races for a season.",
      inputSchema: z.object( { year: z.number().describe("Season year.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await races(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "drivers",
    {
      title: "Drivers",
      description: "List drivers for a session.",
      inputSchema: z.object( { session: z.number().describe("Session key.").optional(), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await drivers(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
