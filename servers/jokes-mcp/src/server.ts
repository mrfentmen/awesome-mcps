import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { dadJoke, searchDadJokes, joke, categories } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: 'jokes-mcp', version: '1.0.0' })
  server.tool('dadJoke', 'Random dad joke from icanhazdadjoke.', {}, async () => {
    try { return text(await dadJoke()) } catch (e) { return text(error(e)) }
  })
  server.tool('searchDadJokes', 'Search dad jokes by term.', { query: z.string().describe('Search term.').optional(), limit: z.number().describe('Max results.').optional() }, async (args) => {
    try { return text(await searchDadJokes(args)) } catch (e) { return text(error(e)) }
  })
  server.tool('joke', 'Random joke from JokeAPI, optionally by category (Programming, Dark, Pun, etc.).', { category: z.string().describe('Optional category.').optional() }, async (args) => {
    try { return text(await joke(args)) } catch (e) { return text(error(e)) }
  })
  server.tool('categories', 'List available JokeAPI categories.', {}, async () => {
    try { return text(await categories()) } catch (e) { return text(error(e)) }
  })
  return server
}
