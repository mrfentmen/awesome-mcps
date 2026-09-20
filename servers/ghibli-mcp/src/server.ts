import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { film } from "./api.js"
import { films } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "ghibli-mcp", version: "1.0.0" })
  server.registerTool(
    "films",
    {
      title: "Films",
      description: "All Studio Ghibli films.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await films(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "film",
    {
      title: "Film",
      description: "Details for one film.",
      inputSchema: z.object( { id: z.string().describe("Film id.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await film(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
