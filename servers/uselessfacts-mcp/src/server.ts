import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_fact, m1_randomFact } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'uselessfacts-mcp', version: '1.0.0' })
server.tool("fact", "Random useless fact.", {  }, async (args) => {
    try { return text(await m0_fact(args)) } catch (e) { return text(error(e)) }
  })
server.tool("random_fact", "Get a random interesting fact.", {  }, async (args) => {
    try { return text(await m1_randomFact(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
