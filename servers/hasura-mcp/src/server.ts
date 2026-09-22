import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { exportMetadata, formatMetadata, formatSqlResult, HasuraError, runSql } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "hasura-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "export_metadata",
    {
      title: "Export metadata",
      description: "Hasura metadata: sources and tracked tables. Needs HASURA_ADMIN_SECRET.",
      inputSchema: z.object({}),
      annotations: READ_ONLY,
    },
    async () => {
      try {
        return text(formatMetadata(await exportMetadata()))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "run_sql",
    {
      title: "Run SQL",
      description: "Run read-only SQL against a Hasura Postgres source. Only SELECT/WITH queries are sent.",
      inputSchema: z.object({
        sql: z.string().describe("SELECT or WITH query"),
        source: z.string().default("default").describe("Source name"),
      }),
      annotations: READ_ONLY,
    },
    async ({ sql, source }) => {
      try {
        const clean = sql.trim().toLowerCase()
        if (!(clean.startsWith("select") || clean.startsWith("with"))) {
          return textError("Error: only SELECT/WITH queries are allowed through this tool.")
        }
        return text(formatSqlResult(await runSql(sql, source)))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof HasuraError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
