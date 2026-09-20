import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { group } from "./api.js"
import { satellite } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "celestrak-mcp", version: "1.0.0" })
  server.registerTool(
    "group",
    {
      title: "Group",
      description: "Satellites in a named group.",
      inputSchema: z.object( { group: z.string().describe("Group like stations, visual, or active.").optional(), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await group(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "satellite",
    {
      title: "Satellite",
      description: "One satellite by NORAD catalog number.",
      inputSchema: z.object( { noradId: z.number().describe("NORAD catalog number.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await satellite(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
