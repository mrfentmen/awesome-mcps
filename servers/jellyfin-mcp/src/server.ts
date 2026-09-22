import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { formatLibrary, formatUser, JellyfinError, listLibraries, listUsers, serverInfo } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "jellyfin-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "server_info",
    {
      title: "Server info",
      description: "Public info of the Jellyfin server: name, version. No key needed. Set JELLYFIN_URL for non-default hosts.",
      inputSchema: z.object({}),
      annotations: READ_ONLY,
    },
    async () => {
      try {
        const info = await serverInfo()
        return text(`${info.name ?? "Jellyfin"}${info.version ? ` ${info.version}` : ""}${info.id ? `\nId: ${info.id}` : ""}`)
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "list_users",
    {
      title: "List users",
      description: "Users on the server with admin flags and last activity. Needs JELLYFIN_API_KEY.",
      inputSchema: z.object({}),
      annotations: READ_ONLY,
    },
    async () => {
      try {
        const rows = await listUsers()
        if (rows.length === 0) return text("No users.")
        return text(rows.map((u, i) => formatUser(u, i)).join("\n"))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "list_libraries",
    {
      title: "List libraries",
      description: "Media libraries (movies, shows, music) with collection types. Needs JELLYFIN_API_KEY.",
      inputSchema: z.object({}),
      annotations: READ_ONLY,
    },
    async () => {
      try {
        const rows = await listLibraries()
        if (rows.length === 0) return text("No libraries.")
        return text(rows.map((l, i) => formatLibrary(l, i)).join("\n"))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof JellyfinError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
