import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_users, m1_generate, m1_seed } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'randomuser-mcp', version: '1.0.0' })
server.registerTool(
    "users",
    {
      title: "Users",
      description: "Random user profiles.",
      inputSchema: z.object( { count: z.number().describe("Number of users.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m0_users(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "generate",
    {
      title: "Generate",
      description: "Generate random user profiles.",
      inputSchema: z.object( { count: z.number().describe("How many profiles.").optional(), gender: z.string().describe("male, female, or any.").optional(), nat: z.string().describe("Nationality code, for example us or gb.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m1_generate(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "seed",
    {
      title: "Seed",
      description: "Generate the same profiles every time with a seed.",
      inputSchema: z.object( { seed: z.string().describe("Seed value."), count: z.number().describe("How many profiles.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m1_seed(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
