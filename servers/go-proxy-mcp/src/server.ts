import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_latest, m0_versions } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'go-proxy-mcp', version: '1.0.0' })
server.registerTool(
    "latest",
    {
      title: "Latest",
      description: "Latest version of a Go module.",
      inputSchema: z.object( { module: z.string().describe("Module path like github.com/gin-gonic/gin.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m0_latest(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "versions",
    {
      title: "Versions",
      description: "Available versions of a Go module.",
      inputSchema: z.object( { module: z.string().describe("Module path."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m0_versions(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
