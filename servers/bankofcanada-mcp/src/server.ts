import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { list } from "./api.js"
import { rate } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "bankofcanada-mcp", version: "1.0.0" })
  server.tool("rate", "Latest rate for a series.", { series: z.string().describe("Series id like FXUSDCAD.") }, async (args) => {
    try { return text(await rate(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("list", "Available series.", {  }, async (args) => {
    try { return text(await list(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
