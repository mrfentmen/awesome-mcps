import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { avatarUrl } from "./api.js"
import { initialsAvatar } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "avatar-mcp", version: "1.0.0" })
  server.registerTool(
    "initials_avatar",
    {
      title: "Initials avatar",
      description: "Get an avatar SVG for a name.",
      inputSchema: z.object( { name: z.string().describe("Name to use for initials."), style: z.string().describe("Style like initials, pixel-art, or lorelei.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await initialsAvatar(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "avatar_url",
    {
      title: "Avatar url",
      description: "Get the avatar URL without fetching the image.",
      inputSchema: z.object( { name: z.string().describe("Name to use."), style: z.string().describe("Style.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await avatarUrl(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
