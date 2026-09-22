import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { CodewarsError, formatKata, formatUser, getKata, getUser } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "codewars-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "get_user",
    {
      title: "Get user",
      description: "A Codewars user: honor, rank, clan, languages, completed kata.",
      inputSchema: z.object({
        username: z.string().describe("Codewars username"),
      }),
      annotations: READ_ONLY,
    },
    async ({ username }) => {
      try {
        return text(formatUser(await getUser(username)))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "get_kata",
    {
      title: "Get kata",
      description: "One kata by id or slug: name, rank, tags.",
      inputSchema: z.object({
        id_or_slug: z.string().describe("Kata id or slug, e.g. 'valid-parentheses'"),
      }),
      annotations: READ_ONLY,
    },
    async ({ id_or_slug }) => {
      try {
        return text(formatKata(await getKata(id_or_slug)))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof CodewarsError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
