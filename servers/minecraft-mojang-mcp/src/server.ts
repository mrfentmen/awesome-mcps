import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { profile } from "./api.js"
import { status } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "minecraft-mojang-mcp", version: "1.0.0" })
  server.registerTool(
    "profile",
    {
      title: "Profile",
      description: "Minecraft profile for a username.",
      inputSchema: z.object( { username: z.string().describe("Minecraft username.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await profile(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "server",
    {
      title: "Server",
      description: "Status for a Minecraft server.",
      inputSchema: z.object( { host: z.string().describe("Server host.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await status(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
