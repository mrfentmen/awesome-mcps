import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { formatResult, runQuery, serverVersion, SurrealDbError } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "surrealdb-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "server_version",
    {
      title: "Server version",
      description: "SurrealDB server version. No auth needed. Set SURREALDB_URL for non-default hosts.",
      inputSchema: z.object({}),
      annotations: READ_ONLY,
    },
    async () => {
      try {
        return text(`SurrealDB ${await serverVersion()}`)
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "run_query",
    {
      title: "Run read query",
      description: "Run a read-only SurrealQL query (SELECT/RETURN/SHOW/DESCRIBE/INFO/COUNT/LET). Needs credentials.",
      inputSchema: z.object({
        sql: z.string().describe("SurrealQL read query, e.g. 'SELECT * FROM person LIMIT 5'"),
      }),
      annotations: READ_ONLY,
    },
    async ({ sql }) => {
      try {
        return text(formatResult(await runQuery(sql)))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof SurrealDbError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
