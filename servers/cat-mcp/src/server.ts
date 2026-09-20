import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { fact, breeds, breedInfo, photo, searchImages } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: 'cat-mcp', version: '1.0.0' })
  server.registerTool(
    'fact',
    {
      title: "Fact",
      description: 'Random cat fact from Cat Facts.',
      inputSchema: z.object({}),
      annotations: READ_ONLY,
    },
    async () => {
    try { return text(await fact()) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    'breeds',
    {
      title: "Breeds",
      description: 'List cat breeds from Cat Facts.',
      inputSchema: z.object( { limit: z.number().describe('Max results.').optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await breeds(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    'breedInfo',
    {
      title: "Breed Info",
      description: 'Detailed breed info from TheCatAPI by breed id.',
      inputSchema: z.object( { breed_id: z.string().describe('Breed id or name.').optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await breedInfo(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    'photo',
    {
      title: "Photo",
      description: 'Random cat photo from Cataas, optionally by tag.',
      inputSchema: z.object( { tag: z.string().describe('Optional tag filter.').optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await photo(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    'searchImages',
    {
      title: "Search Images",
      description: 'Fetch several random cat photos, optionally by tag.',
      inputSchema: z.object( { tag: z.string().describe('Optional tag filter.').optional(), limit: z.number().describe('How many photos.').optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await searchImages(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
