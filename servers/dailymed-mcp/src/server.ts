import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { search } from "./api.js"
import { spl } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "dailymed-mcp", version: "1.0.0" })
  server.tool("search", "Search drug labels by name.", { drugName: z.string().describe("Drug name like aspirin."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await search(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("spl", "One structured product label by set ID.", { setId: z.string().describe("DailyMed set ID.") }, async (args) => {
    try { return text(await spl(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
