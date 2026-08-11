import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_define, m0_wordOfDay, m1_randomWord, m1_wordOfTheDay } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'dictionary-mcp', version: '1.0.0' })
server.tool("define", "Get the definition of a word.", { word: z.string().describe("Word to look up.") }, async (args) => {
    try { return text(await m0_define(args)) } catch (e) { return text(error(e)) }
  })
server.tool("word_of_day", "Get a random word with its definition.", {  }, async (args) => {
    try { return text(await m0_wordOfDay(args)) } catch (e) { return text(error(e)) }
  })
server.tool("word_of_the_day", "Get the featured word of the day.", {  }, async (args) => {
    try { return text(await m1_wordOfTheDay(args)) } catch (e) { return text(error(e)) }
  })
server.tool("random_word", "Get a random word with its definition.", {  }, async (args) => {
    try { return text(await m1_randomWord(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
