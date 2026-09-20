import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { filter } from "./api.js"
import { suggest } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "wordle-helper-mcp", version: "1.0.0" })
  server.registerTool(
    "suggest",
    {
      title: "Suggest",
      description: "Suggest a starting guess.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await suggest(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "filter",
    {
      title: "Filter",
      description: "Filter candidates given feedback.",
      inputSchema: z.object( { guesses: z.string().describe("JSON array of {word, marks} where marks are g, y, or x per letter.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await filter(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
