import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { dadJoke, searchDadJokes, joke, categories } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: 'jokes-mcp', version: '1.0.0' })
  server.registerTool(
    'dadJoke',
    {
      title: "Dad Joke",
      description: 'Random dad joke from icanhazdadjoke.',
      inputSchema: z.object({}),
      annotations: READ_ONLY,
    },
    async () => {
    try { return text(await dadJoke()) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    'searchDadJokes',
    {
      title: "Search Dad Jokes",
      description: 'Search dad jokes by term.',
      inputSchema: z.object( { query: z.string().describe('Search term.').optional(), limit: z.number().describe('Max results.').optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await searchDadJokes(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    'joke',
    {
      title: "Joke",
      description: 'Random joke from JokeAPI, optionally by category (Programming, Dark, Pun, etc.).',
      inputSchema: z.object( { category: z.string().describe('Optional category.').optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await joke(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    'categories',
    {
      title: "Categories",
      description: 'List available JokeAPI categories.',
      inputSchema: z.object({}),
      annotations: READ_ONLY,
    },
    async () => {
    try { return text(await categories()) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
