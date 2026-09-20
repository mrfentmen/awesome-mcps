import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { CtanError, formatPackage, getPackage } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "ctan-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "get_package",
    {
      title: "Get CTAN package",
      description: "Get a CTAN LaTeX package: description, authors, version, paths, install command.",
      inputSchema: z.object({
        key: z.string().describe("Package key, e.g. 'beamer', 'tikz', 'biblatex'"),
      }),
      annotations: READ_ONLY,
    },
    async ({ key }) => {
      try {
        return text(formatPackage(await getPackage(key)))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof CtanError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
