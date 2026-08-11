import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_latest, m0_versions } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'go-proxy-mcp', version: '1.0.0' })
server.tool("latest", "Latest version of a Go module.", { module: z.string().describe("Module path like github.com/gin-gonic/gin.") }, async (args) => {
    try { return text(await m0_latest(args)) } catch (e) { return text(error(e)) }
  })
server.tool("versions", "Available versions of a Go module.", { module: z.string().describe("Module path."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m0_versions(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
