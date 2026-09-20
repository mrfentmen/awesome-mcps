import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { featured } from "./api.js"
import { mostread } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "wikitrending-mcp", version: "1.0.0" })
  server.registerTool(
    "featured",
    {
      title: "Featured",
      description: "Featured article for a date.",
      inputSchema: z.object( { date: z.string().describe("Date YYYY/MM/DD, defaults to today.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await featured(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "mostread",
    {
      title: "Mostread",
      description: "Most-read articles for a date.",
      inputSchema: z.object( { date: z.string().describe("Date YYYY/MM/DD, defaults to today.").optional(), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await mostread(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
