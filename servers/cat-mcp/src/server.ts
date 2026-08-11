import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { fact, breeds, breedInfo, photo, searchImages } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: 'cat-mcp', version: '1.0.0' })
  server.tool('fact', 'Random cat fact from Cat Facts.', {}, async () => {
    try { return text(await fact()) } catch (e) { return text(error(e)) }
  })
  server.tool('breeds', 'List cat breeds from Cat Facts.', { limit: z.number().describe('Max results.').optional() }, async (args) => {
    try { return text(await breeds(args)) } catch (e) { return text(error(e)) }
  })
  server.tool('breedInfo', 'Detailed breed info from TheCatAPI by breed id.', { breed_id: z.string().describe('Breed id or name.').optional() }, async (args) => {
    try { return text(await breedInfo(args)) } catch (e) { return text(error(e)) }
  })
  server.tool('photo', 'Random cat photo from Cataas, optionally by tag.', { tag: z.string().describe('Optional tag filter.').optional() }, async (args) => {
    try { return text(await photo(args)) } catch (e) { return text(error(e)) }
  })
  server.tool('searchImages', 'Fetch several random cat photos, optionally by tag.', { tag: z.string().describe('Optional tag filter.').optional(), limit: z.number().describe('How many photos.').optional() }, async (args) => {
    try { return text(await searchImages(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
