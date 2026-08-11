import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { connections } from "./api.js"
import { stations } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "irail-mcp", version: "1.0.0" })
  server.tool("stations", "List stations.", {  }, async (args) => {
    try { return text(await stations(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("connections", "Connections between stations.", { from: z.string().describe("Origin station."), to: z.string().describe("Destination station."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await connections(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
