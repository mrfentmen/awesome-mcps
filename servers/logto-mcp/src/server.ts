import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { listApplications, listUsers, LogtoError } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "logto-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "list_users",
    {
      title: "List users",
      description: "Logto users with emails and join dates.",
      inputSchema: z.object({
        limit: z.number().int().min(1).max(100).default(10),
      }),
      annotations: READ_ONLY,
    },
    async ({ limit }) => {
      try {
        const rows = await listUsers(limit)
        if (rows.length === 0) return text("No users.")
        return text(rows.map((u, i) => `${i + 1}. [${u.id}] ${u.username ?? u.email ?? "(unnamed)"}${u.created ? ` (since ${u.created})` : ""}`).join("\n"))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "list_applications",
    {
      title: "List applications",
      description: "Logto applications (OIDC clients) with types.",
      inputSchema: z.object({
        limit: z.number().int().min(1).max(100).default(10),
      }),
      annotations: READ_ONLY,
    },
    async ({ limit }) => {
      try {
        const rows = await listApplications(limit)
        if (rows.length === 0) return text("No applications.")
        return text(rows.map((a, i) => `${i + 1}. [${a.id}] ${a.name ?? "(unnamed)"}${a.type ? ` (${a.type})` : ""}`).join("\n"))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof LogtoError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
