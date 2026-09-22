import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { InngestError, listApps, sendEvent } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const WRITE = { readOnlyHint: false, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "inngest-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "send_event",
    {
      title: "Send event",
      description: "Send an event to Inngest to trigger functions. Needs INNGEST_EVENT_KEY.",
      inputSchema: z.object({
        name: z.string().describe("Event name, e.g. 'app/user.signup'"),
        data: z.record(z.string(), z.unknown()).describe("Event payload as a JSON object"),
      }),
      annotations: WRITE,
    },
    async ({ name, data }) => {
      try {
        return text(await sendEvent(name, data as Record<string, unknown>))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "list_apps",
    {
      title: "List apps",
      description: "Registered Inngest apps. Needs INNGEST_SIGNING_KEY.",
      inputSchema: z.object({}),
      annotations: READ_ONLY,
    },
    async () => {
      try {
        const rows = await listApps()
        if (rows.length === 0) return text("No apps.")
        return text(rows.map((a, i) => `${i + 1}. ${a.name ?? a.id ?? "?"}${a.url ? ` — ${a.url}` : ""}`).join("\n"))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof InngestError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
