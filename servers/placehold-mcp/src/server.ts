import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { image } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "placehold-mcp", version: "1.0.0" })
  server.tool("image", "Placeholder image URL.", { width: z.number().describe("Width.").optional(), height: z.number().describe("Height.").optional(), text: z.string().describe("Optional label text.").optional() }, async (args) => {
    try { return text(await image(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
