import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { AbuseIpDbError, blacklist, checkIp } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "abuseipdb-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "check_ip",
    {
      title: "Check IP",
      description: "Abuse confidence, country, ISP, recent reports for an IP.",
      inputSchema: z.object({
        ip: z.string().describe("IPv4 or IPv6 address"),
        days: z.number().int().min(1).max(365).default(90).describe("Report window in days"),
      }),
      annotations: READ_ONLY,
    },
    async ({ ip, days }) => {
      try {
        return text(await checkIp(ip, days))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "blacklist",
    {
      title: "Top blacklist",
      description: "Worst reported IPs right now with confidence scores.",
      inputSchema: z.object({
        limit: z.number().int().min(1).max(100).default(10),
      }),
      annotations: READ_ONLY,
    },
    async ({ limit }) => {
      try {
        const rows = await blacklist(limit)
        if (rows.length === 0) return text("Blacklist is empty.")
        return text(rows.map((r, i) => `${i + 1}. ${r}`).join("\n"))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof AbuseIpDbError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
