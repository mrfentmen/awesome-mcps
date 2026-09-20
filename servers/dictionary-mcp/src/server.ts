import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_define, m0_wordOfDay, m1_randomWord, m1_wordOfTheDay } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'dictionary-mcp', version: '1.0.0' })
server.registerTool(
    "define",
    {
      title: "Define",
      description: "Get the definition of a word.",
      inputSchema: z.object( { word: z.string().describe("Word to look up.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m0_define(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "word_of_day",
    {
      title: "Word of day",
      description: "Get a random word with its definition.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m0_wordOfDay(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "word_of_the_day",
    {
      title: "Word of the day",
      description: "Get the featured word of the day.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m1_wordOfTheDay(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "random_word",
    {
      title: "Random word",
      description: "Get a random word with its definition.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m1_randomWord(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
