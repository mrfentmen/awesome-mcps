import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_radar, m1_timeline } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'rainviewer-mcp', version: '1.0.0' })
server.tool("radar", "Current radar tile index.", {  }, async (args) => {
    try { return text(await m0_radar(args)) } catch (e) { return text(error(e)) }
  })
server.tool("timeline", "Radar tile timeline with past, nowcast, and forecast frames.", {  }, async (args) => {
    try { return text(await m1_timeline(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
