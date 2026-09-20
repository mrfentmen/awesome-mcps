import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_define, m0_random } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'urban-dictionary-mcp', version: '1.0.0' })
server.registerTool(
    "define",
    {
      title: "Define",
      description: "Get definitions for a term.",
      inputSchema: z.object( { term: z.string().describe("The term to look up."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m0_define(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "random",
    {
      title: "Random",
      description: "Get a random Urban Dictionary entry.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m0_random(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
