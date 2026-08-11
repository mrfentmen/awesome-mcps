import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_quoteOfTheDay, m0_randomQuote, m1_qotd, m1_search, m2_random, m3_many, m3_random, m4_random, m4_today, m4_quotes } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'quotes-mcp', version: '1.0.0' })
server.tool("quote_of_the_day", "Get the quote of the day.", {  }, async (args) => {
    try { return text(await m0_quoteOfTheDay(args)) } catch (e) { return text(error(e)) }
  })
server.tool("random_quote", "Get a random quote.", {  }, async (args) => {
    try { return text(await m0_randomQuote(args)) } catch (e) { return text(error(e)) }
  })
server.tool("qotd", "Quote of the day.", {  }, async (args) => {
    try { return text(await m1_qotd(args)) } catch (e) { return text(error(e)) }
  })
server.tool("search", "Search quotes.", { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m1_search(args)) } catch (e) { return text(error(e)) }
  })
server.tool("random", "A random inspirational quote.", {  }, async (args) => {
    try { return text(await m2_random(args)) } catch (e) { return text(error(e)) }
  })
server.tool("many", "Several quotes.", { count: z.number().describe("How many.").optional() }, async (args) => {
    try { return text(await m3_many(args)) } catch (e) { return text(error(e)) }
  })
server.tool('today', 'Quote of the day.', {}, async (args) => {
    try { return text(await m4_today(args)) } catch (e) { return text(error(e)) }
  })
server.tool('quotes', 'List of quotes.', { limit: z.number().describe('Max results.').optional() }, async (args) => {
    try { return text(await m4_quotes(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
