import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { many } from "./api.js"
import { random } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "stoic-quotes-mcp", version: "1.0.0" })
  server.tool("random", "One random Stoic quote.", {  }, async (args) => {
    try { return text(await random(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("many", "Several quotes.", { count: z.number().describe("How many.").optional() }, async (args) => {
    try { return text(await many(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
