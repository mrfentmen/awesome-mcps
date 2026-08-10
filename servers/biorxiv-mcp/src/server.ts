import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { details } from "./api.js"
import { recent } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "biorxiv-mcp", version: "1.0.0" })
  server.tool("details", "Get preprint details.", { doi: z.string().describe("bioRxiv DOI.") }, async (args) => {
    try { return text(await details(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("recent", "Recent preprints.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await recent(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
