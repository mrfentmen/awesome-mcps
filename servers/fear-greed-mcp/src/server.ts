import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { current } from "./api.js"
import { history } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "fear-greed-mcp", version: "1.0.0" })
  server.tool("current", "The current fear and greed index.", {  }, async (args) => {
    try { return text(await current(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("history", "Recent fear and greed index values.", { days: z.number().describe("How many days back.").optional() }, async (args) => {
    try { return text(await history(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
