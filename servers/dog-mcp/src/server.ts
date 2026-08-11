import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { listBreeds, randomImage, breedImages, facts, randomMedia } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: 'dog-mcp', version: '1.0.0' })
  server.tool('listBreeds', 'List all dog breeds from dog.ceo.', {}, async () => {
    try { return text(await listBreeds()) } catch (e) { return text(error(e)) }
  })
  server.tool('randomImage', 'Random dog photo from dog.ceo, optionally by breed.', { breed: z.string().describe('Optional breed name.').optional() }, async (args) => {
    try { return text(await randomImage(args)) } catch (e) { return text(error(e)) }
  })
  server.tool('breedImages', 'Several random photos of a specific breed.', { breed: z.string().describe('Breed name.').optional(), limit: z.number().describe('How many images.').optional() }, async (args) => {
    try { return text(await breedImages(args)) } catch (e) { return text(error(e)) }
  })
  server.tool('facts', 'Random dog facts from dogapi.dog.', { limit: z.number().describe('How many facts.').optional() }, async (args) => {
    try { return text(await facts(args)) } catch (e) { return text(error(e)) }
  })
  server.tool('randomMedia', 'Random dog photo or video from random.dog.', {}, async () => {
    try { return text(await randomMedia()) } catch (e) { return text(error(e)) }
  })
  return server
}
