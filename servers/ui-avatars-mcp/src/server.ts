import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { avatar } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "ui-avatars-mcp", version: "1.0.0" })
  server.tool("avatar", "Avatar URL for a name.", { name: z.string().describe("Name or initials."), size: z.number().describe("Pixel size.").optional() }, async (args) => {
    try { return text(await avatar(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
