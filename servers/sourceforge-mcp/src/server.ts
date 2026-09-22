import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { formatProject, getProject, SourceForgeError } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "sourceforge-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "get_project",
    {
      title: "Get project",
      description: "A SourceForge project: name, description, link.",
      inputSchema: z.object({
        shortname: z.string().describe("Project shortname, e.g. 'filezilla'"),
      }),
      annotations: READ_ONLY,
    },
    async ({ shortname }) => {
      try {
        return text(formatProject(await getProject(shortname)))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof SourceForgeError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
