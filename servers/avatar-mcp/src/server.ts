import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { avatarUrl } from "./api.js"
import { initialsAvatar } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "avatar-mcp", version: "1.0.0" })
  server.tool("initials_avatar", "Get an avatar SVG for a name.", { name: z.string().describe("Name to use for initials."), style: z.string().describe("Style like initials, pixel-art, or lorelei.").optional() }, async (args) => {
    try { return text(await initialsAvatar(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("avatar_url", "Get the avatar URL without fetching the image.", { name: z.string().describe("Name to use."), style: z.string().describe("Style.").optional() }, async (args) => {
    try { return text(await avatarUrl(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
