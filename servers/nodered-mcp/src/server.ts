import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { formatFlow, getFlow, listFlows, NodeRedError } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "nodered-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "list_flows",
    {
      title: "List flows",
      description: "Node-RED flow tabs with ids and labels. Set NODERED_URL for non-default hosts.",
      inputSchema: z.object({}),
      annotations: READ_ONLY,
    },
    async () => {
      try {
        const rows = await listFlows()
        if (rows.length === 0) return text("No flows.")
        return text(rows.map((f, i) => `${i + 1}. [${f.id}] ${f.label ?? "(unnamed)"}${f.disabled ? " (disabled)" : ""}`).join("\n"))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "get_flow",
    {
      title: "Get flow",
      description: "One flow: node count plus node-type breakdown.",
      inputSchema: z.object({
        id: z.string().describe("Flow tab id (use list_flows)"),
      }),
      annotations: READ_ONLY,
    },
    async ({ id }) => {
      try {
        return text(formatFlow(id, await getFlow(id)))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof NodeRedError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
