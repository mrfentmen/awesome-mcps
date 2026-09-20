import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { champion } from "./api.js"
import { champions } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "lol-datadragon-mcp", version: "1.0.0" })
  server.registerTool(
    "champions",
    {
      title: "Champions",
      description: "All champions.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await champions(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "champion",
    {
      title: "Champion",
      description: "Details for one champion.",
      inputSchema: z.object( { name: z.string().describe("Champion name.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await champion(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
