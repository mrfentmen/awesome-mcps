import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { agencies } from "./api.js"
import { predictions } from "./api.js"
import { routes } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "nextbus-mcp", version: "1.0.0" })
  server.registerTool(
    "agencies",
    {
      title: "Agencies",
      description: "List transit agencies.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await agencies(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "routes",
    {
      title: "Routes",
      description: "List routes for an agency.",
      inputSchema: z.object( { agency: z.string().describe("Agency tag.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await routes(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "predictions",
    {
      title: "Predictions",
      description: "Get arrival predictions for a stop.",
      inputSchema: z.object( { agency: z.string().describe("Agency tag."), stop: z.string().describe("Stop id."), route: z.string().describe("Route tag.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await predictions(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
