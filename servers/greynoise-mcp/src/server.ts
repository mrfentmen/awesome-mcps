import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { checkIp, GreyNoiseError, queryTags } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "greynoise-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "check_ip",
    {
      title: "Check IP noise",
      description: "Is an IP background internet noise or a targeted threat? With tags.",
      inputSchema: z.object({
        ip: z.string().describe("IPv4 address"),
      }),
      annotations: READ_ONLY,
    },
    async ({ ip }) => {
      try {
        return text(await checkIp(ip))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "query_tags",
    {
      title: "Query by tag",
      description: "IPs matching a GreyNoise query, e.g. 'tags:Mirai'.",
      inputSchema: z.object({
        query: z.string().describe("GNQL query, e.g. 'tags:Mirai'"),
        limit: z.number().int().min(1).max(50).default(5),
      }),
      annotations: READ_ONLY,
    },
    async ({ query, limit }) => {
      try {
        const rows = await queryTags(query, limit)
        if (rows.length === 0) return text(`Nothing for "${query}".`)
        return text(rows.map((r, i) => `${i + 1}. ${r}`).join("\n"))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof GreyNoiseError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
