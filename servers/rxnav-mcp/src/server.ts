import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { properties } from "./api.js"
import { search } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "rxnav-mcp", version: "1.0.0" })
  server.tool("search", "Find drug candidates matching a term.", { term: z.string().describe("Drug name like lipitor.") }, async (args) => {
    try { return text(await search(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("properties", "Properties for an RxNorm identifier.", { rxcui: z.string().describe("RxNorm identifier.") }, async (args) => {
    try { return text(await properties(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
