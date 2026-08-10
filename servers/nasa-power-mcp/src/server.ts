import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { daily } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "nasa-power-mcp", version: "1.0.0" })
  server.tool("daily", "Daily solar and weather values for a point.", { latitude: z.number().describe("Latitude."), longitude: z.number().describe("Longitude."), parameters: z.string().describe("Comma separated parameters like T2M,PRECTOTCORR.").optional(), start: z.string().describe("Start date YYYYMMDD.").optional(), end: z.string().describe("End date YYYYMMDD.").optional() }, async (args) => {
    try { return text(await daily(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
