import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { indicators } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "un-sdg-mcp", version: "1.0.0" })
  server.tool("indicators", "List SDG indicators.", { goal: z.string().describe("Goal number like 3.").optional(), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await indicators(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
