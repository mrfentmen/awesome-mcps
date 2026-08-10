import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { fact } from "./api.js"
import { many } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "meowfacts-mcp", version: "1.0.0" })
  server.tool("fact", "One random cat fact.", {  }, async (args) => {
    try { return text(await fact(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("many", "Several cat facts.", { count: z.number().describe("How many facts.").optional() }, async (args) => {
    try { return text(await many(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
