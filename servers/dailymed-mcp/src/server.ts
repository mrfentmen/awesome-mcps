import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { search } from "./api.js"
import { spl } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "dailymed-mcp", version: "1.0.0" })
  server.registerTool(
    "search",
    {
      title: "Search",
      description: "Search drug labels by name.",
      inputSchema: z.object( { drugName: z.string().describe("Drug name like aspirin."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await search(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "spl",
    {
      title: "Spl",
      description: "One structured product label by set ID.",
      inputSchema: z.object( { setId: z.string().describe("DailyMed set ID.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await spl(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
