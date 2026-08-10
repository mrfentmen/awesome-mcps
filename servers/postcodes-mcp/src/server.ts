import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { lookup } from "./api.js"
import { random } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "postcodes-mcp", version: "1.0.0" })
  server.tool("lookup", "Look up a postcode.", { postcode: z.string().describe("UK postcode.") }, async (args) => {
    try { return text(await lookup(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("random", "Get a random postcode.", {  }, async (args) => {
    try { return text(await random(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
