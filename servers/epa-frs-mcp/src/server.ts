import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { byState } from "./api.js"
import { facility } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "epa-frs-mcp", version: "1.0.0" })
  server.registerTool(
    "by_state",
    {
      title: "By state",
      description: "Facilities in a US state.",
      inputSchema: z.object( { state: z.string().describe("Two letter state code like VA."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await byState(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "facility",
    {
      title: "Facility",
      description: "One facility by registry ID.",
      inputSchema: z.object( { registryId: z.string().describe("FRS registry ID.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await facility(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
