import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { listBreeds, randomImage, breedImages, facts, randomMedia } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: 'dog-mcp', version: '1.0.0' })
  server.registerTool(
    'listBreeds',
    {
      title: "List Breeds",
      description: 'List all dog breeds from dog.ceo.',
      inputSchema: z.object({}),
      annotations: READ_ONLY,
    },
    async () => {
    try { return text(await listBreeds()) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    'randomImage',
    {
      title: "Random Image",
      description: 'Random dog photo from dog.ceo, optionally by breed.',
      inputSchema: z.object( { breed: z.string().describe('Optional breed name.').optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await randomImage(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    'breedImages',
    {
      title: "Breed Images",
      description: 'Several random photos of a specific breed.',
      inputSchema: z.object( { breed: z.string().describe('Breed name.').optional(), limit: z.number().describe('How many images.').optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await breedImages(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    'facts',
    {
      title: "Facts",
      description: 'Random dog facts from dogapi.dog.',
      inputSchema: z.object( { limit: z.number().describe('How many facts.').optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await facts(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    'randomMedia',
    {
      title: "Random Media",
      description: 'Random dog photo or video from random.dog.',
      inputSchema: z.object({}),
      annotations: READ_ONLY,
    },
    async () => {
    try { return text(await randomMedia()) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
