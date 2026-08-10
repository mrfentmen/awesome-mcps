import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { chain } from "./api.js"
import { stats } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "blockchair-mcp", version: "1.0.0" })
  server.tool("stats", "Bitcoin network stats.", {  }, async (args) => {
    try { return text(await stats(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("chain", "Stats for a chain.", { chain: z.string().describe("Chain like bitcoin.").optional() }, async (args) => {
    try { return text(await chain(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
