import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { all } from "./api.js"
import { fruit } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "fruityvice-mcp", version: "1.0.0" })
  server.registerTool(
    "fruit",
    {
      title: "Fruit",
      description: "Get a fruit by name.",
      inputSchema: z.object( { name: z.string().describe("Fruit name.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await fruit(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "all",
    {
      title: "All",
      description: "List all fruits.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await all(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
