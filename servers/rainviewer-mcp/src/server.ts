import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_radar, m1_timeline } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'rainviewer-mcp', version: '1.0.0' })
server.registerTool(
    "radar",
    {
      title: "Radar",
      description: "Current radar tile index.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m0_radar(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "timeline",
    {
      title: "Timeline",
      description: "Radar tile timeline with past, nowcast, and forecast frames.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m1_timeline(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
