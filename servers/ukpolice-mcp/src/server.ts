import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { street } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "ukpolice-mcp", version: "1.0.0" })
  server.tool("street", "Street-level crimes near coordinates.", { lat: z.number().describe("Latitude."), lng: z.number().describe("Longitude."), date: z.string().describe("Month YYYY-MM.").optional(), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await street(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
