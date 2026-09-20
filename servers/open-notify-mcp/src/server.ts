import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { astronauts } from "./api.js"
import { iss } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "open-notify-mcp", version: "1.0.0" })
  server.registerTool(
    "astronauts",
    {
      title: "Astronauts",
      description: "List people in space right now.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await astronauts(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "iss",
    {
      title: "Iss",
      description: "Current ISS position.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await iss(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
