import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { indicator } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "imf-mcp", version: "1.0.0" })
  server.tool("indicator", "Get indicator series for a country.", { indicator: z.string().describe("Indicator like NGDPD."), country: z.string().describe("Country code like USA.").optional(), limit: z.number().describe("Max years.").optional() }, async (args) => {
    try { return text(await indicator(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
