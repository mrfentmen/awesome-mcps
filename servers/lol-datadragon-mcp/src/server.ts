import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { champion } from "./api.js"
import { champions } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "lol-datadragon-mcp", version: "1.0.0" })
  server.tool("champions", "All champions.", {  }, async (args) => {
    try { return text(await champions(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("champion", "Details for one champion.", { name: z.string().describe("Champion name.") }, async (args) => {
    try { return text(await champion(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
