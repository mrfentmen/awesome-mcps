import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { formatPulse, ipReputation, OtxError, pulseIndicators, searchPulses } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "otx-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "search_pulses",
    {
      title: "Search pulses",
      description: "Threat pulses by keyword with authors and indicator counts.",
      inputSchema: z.object({
        query: z.string().describe("Search text, e.g. 'ransomware', 'Mirai'"),
        limit: z.number().int().min(1).max(50).default(5),
      }),
      annotations: READ_ONLY,
    },
    async ({ query, limit }) => {
      try {
        const rows = await searchPulses(query, limit)
        if (rows.length === 0) return text(`No pulses for "${query}".`)
        return text(rows.map((p, i) => formatPulse(p, i)).join("\n"))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "pulse_indicators",
    {
      title: "Pulse indicators",
      description: "IOCs of one pulse: IPs, domains, hashes, URLs.",
      inputSchema: z.object({
        id: z.string().describe("Pulse id (use search_pulses)"),
        limit: z.number().int().min(1).max(100).default(10),
      }),
      annotations: READ_ONLY,
    },
    async ({ id, limit }) => {
      try {
        const rows = await pulseIndicators(id, limit)
        if (rows.length === 0) return text(`No indicators for pulse ${id}.`)
        return text(rows.map((r, i) => `${i + 1}. ${r}`).join("\n"))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "ip_reputation",
    {
      title: "IP reputation",
      description: "OTX reputation, country, and pulse memberships for an IPv4.",
      inputSchema: z.object({
        ip: z.string().describe("IPv4 address"),
      }),
      annotations: READ_ONLY,
    },
    async ({ ip }) => {
      try {
        return text(await ipReputation(ip))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof OtxError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
