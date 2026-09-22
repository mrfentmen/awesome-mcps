import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { blockingStatus, PiholeError, setBlocking, summaryStats } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const WRITE = { readOnlyHint: false, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "pihole-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "status",
    {
      title: "Blocking status",
      description: "Whether Pi-hole blocking is on, plus 24h query/blocked stats.",
      inputSchema: z.object({}),
      annotations: READ_ONLY,
    },
    async () => {
      try {
        return text(`${await blockingStatus()}\n\n${await summaryStats()}`)
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "set_blocking",
    {
      title: "Toggle blocking",
      description: "Enable or disable Pi-hole blocking, optionally for N seconds.",
      inputSchema: z.object({
        enabled: z.boolean().describe("true = block ads, false = allow all"),
        seconds: z.number().int().min(0).default(0).describe("Auto re-enable after N seconds (0 = stay)"),
      }),
      annotations: WRITE,
    },
    async ({ enabled, seconds }) => {
      try {
        return text(await setBlocking(enabled, seconds))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof PiholeError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
