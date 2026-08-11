import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { searchVideos, instance } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: 'peertube-mcp', version: '1.0.0' })
  server.tool('searchVideos', 'Search PeerTube.tv videos.', { query: z.string().describe('Search terms.').optional(), limit: z.number().describe('Max results.').optional() }, async (args) => {
    try { return text(await searchVideos(args)) } catch (e) { return text(error(e)) }
  })
  server.tool('instance', 'PeerTube.tv instance info.', {}, async (args) => {
    try { return text(await instance(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
