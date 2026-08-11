import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { byMode } from "./api.js"
import { transmitters } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "satnogs-mcp", version: "1.0.0" })
  server.tool("transmitters", "List satellite transmitters.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await transmitters(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("by_mode", "Transmitters by mode.", { mode: z.string().describe("Mode like FM or CW."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await byMode(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
