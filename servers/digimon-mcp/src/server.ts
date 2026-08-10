import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { level } from "./api.js"
import { search } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "digimon-mcp", version: "1.0.0" })
  server.tool("search", "Search Digimon by name.", { name: z.string().describe("Digimon name."), limit: z.number().describe("Maximum results.").optional() }, async (args) => {
    try { return text(await search(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("level", "List Digimon at a level.", { level: z.string().describe("Rookie, Champion, Ultimate, or Mega."), limit: z.number().describe("Maximum results.").optional() }, async (args) => {
    try { return text(await level(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
