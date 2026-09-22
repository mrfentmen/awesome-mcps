import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { formatEvent, FrigateError, recentEvents, serverVersion, stats } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "frigate-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "status",
    {
      title: "Server status",
      description: "Frigate version, uptime, cameras, detection FPS. Set FRIGATE_URL for non-default hosts.",
      inputSchema: z.object({}),
      annotations: READ_ONLY,
    },
    async () => {
      try {
        return text(`${await serverVersion()}\n\n${await stats()}`)
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "recent_events",
    {
      title: "Recent events",
      description: "Recent detection events, optionally for one camera.",
      inputSchema: z.object({
        camera: z.string().default("").describe("Camera name, empty = all"),
        limit: z.number().int().min(1).max(100).default(10),
      }),
      annotations: READ_ONLY,
    },
    async ({ camera, limit }) => {
      try {
        const rows = await recentEvents(camera, limit)
        if (rows.length === 0) return text("No recent events.")
        return text(rows.map((e, i) => formatEvent(e, i)).join("\n"))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof FrigateError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
