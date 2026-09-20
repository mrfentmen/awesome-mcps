import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { readFeed, feedJson } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: 'rss-mcp', version: '1.0.0' })
  server.registerTool(
    'readFeed',
    {
      title: "Read Feed",
      description: 'Fetch and parse any RSS or Atom feed directly.',
      inputSchema: z.object( { url: z.string().describe('Feed URL.').optional(), limit: z.number().describe('Max entries.').optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await readFeed(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    'feedJson',
    {
      title: "Feed Json",
      description: 'Convert any RSS feed to JSON via rss2json.',
      inputSchema: z.object( { url: z.string().describe('Feed URL.').optional(), limit: z.number().describe('Max entries.').optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await feedJson(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
