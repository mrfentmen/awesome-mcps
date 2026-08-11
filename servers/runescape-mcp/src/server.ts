import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { hiscore } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "runescape-mcp", version: "1.0.0" })
  server.tool("hiscore", "Hiscore for a player.", { player: z.string().describe("Player name.") }, async (args) => {
    try { return text(await hiscore(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
