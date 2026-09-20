import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { monsters } from "./api.js"
import { spells } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "open5e-mcp", version: "1.0.0" })
  server.registerTool(
    "monsters",
    {
      title: "Monsters",
      description: "List monsters with optional search.",
      inputSchema: z.object( { search: z.string().describe("Search terms.").optional(), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await monsters(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "spells",
    {
      title: "Spells",
      description: "List spells with optional search.",
      inputSchema: z.object( { search: z.string().describe("Search terms.").optional(), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await spells(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
