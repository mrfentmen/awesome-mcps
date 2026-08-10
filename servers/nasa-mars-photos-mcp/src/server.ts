import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { photos } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "nasa-mars-photos-mcp", version: "1.0.0" })
  server.tool("photos", "Mars rover photos for a sol.", { rover: z.string().describe("Rover name like curiosity.").optional(), sol: z.number().describe("Martian sol."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await photos(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
