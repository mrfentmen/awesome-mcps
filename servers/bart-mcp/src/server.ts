import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { etd } from "./api.js"
import { stations } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "bart-mcp", version: "1.0.0" })
  server.tool("etd", "Estimated departures for a station.", { station: z.string().describe("Station abbreviation.") }, async (args) => {
    try { return text(await etd(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("stations", "List stations.", {  }, async (args) => {
    try { return text(await stations(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
