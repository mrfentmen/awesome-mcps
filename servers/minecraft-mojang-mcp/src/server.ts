import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { profile } from "./api.js"
import { status } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "minecraft-mojang-mcp", version: "1.0.0" })
  server.tool("profile", "Minecraft profile for a username.", { username: z.string().describe("Minecraft username.") }, async (args) => {
    try { return text(await profile(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("server", "Status for a Minecraft server.", { host: z.string().describe("Server host.") }, async (args) => {
    try { return text(await status(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
