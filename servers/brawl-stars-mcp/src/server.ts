import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { brawler } from "./api.js"
import { brawlers } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "brawl-stars-mcp", version: "1.0.0" })
  server.tool("brawlers", "List all Brawl Stars brawlers.", {  }, async (args) => {
    try { return text(await brawlers()) } catch (e) { return text(error(e)) }
  })
  server.tool("brawler", "Get a single brawler by name.", { name: z.string().describe("Brawler name.") }, async (args) => {
    try { return text(await brawler(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
