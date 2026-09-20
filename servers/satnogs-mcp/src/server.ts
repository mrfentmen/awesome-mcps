import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { byMode } from "./api.js"
import { transmitters } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "satnogs-mcp", version: "1.0.0" })
  server.registerTool(
    "transmitters",
    {
      title: "Transmitters",
      description: "List satellite transmitters.",
      inputSchema: z.object( { limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await transmitters(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "by_mode",
    {
      title: "By mode",
      description: "Transmitters by mode.",
      inputSchema: z.object( { mode: z.string().describe("Mode like FM or CW."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await byMode(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
