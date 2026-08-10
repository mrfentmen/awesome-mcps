import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { events } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "daily-med-mcp", version: "1.0.0" })
  server.tool("events", "Drug adverse event reports for a drug.", { drug: z.string().describe("Brand name."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await events(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
