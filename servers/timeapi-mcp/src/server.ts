import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { convert } from "./api.js"
import { current } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "timeapi-mcp", version: "1.0.0" })
  server.tool("current", "Current time in a zone.", { zone: z.string().describe("IANA zone like Europe/London.") }, async (args) => {
    try { return text(await current(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("convert", "Convert time between zones.", { from: z.string().describe("Source IANA zone."), to: z.string().describe("Target IANA zone."), datetime: z.string().describe("ISO datetime.").optional() }, async (args) => {
    try { return text(await convert(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
