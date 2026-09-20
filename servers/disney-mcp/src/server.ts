import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { character } from "./api.js"
import { characters } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "disney-mcp", version: "1.0.0" })
  server.registerTool(
    "character",
    {
      title: "Character",
      description: "Get a character by id or name.",
      inputSchema: z.object( { query: z.string().describe("Character name or id.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await character(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "characters",
    {
      title: "Characters",
      description: "List characters.",
      inputSchema: z.object( { page: z.number().describe("Page number.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await characters(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
