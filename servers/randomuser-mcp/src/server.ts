import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_users, m1_generate, m1_seed } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'randomuser-mcp', version: '1.0.0' })
server.tool("users", "Random user profiles.", { count: z.number().describe("Number of users.").optional() }, async (args) => {
    try { return text(await m0_users(args)) } catch (e) { return text(error(e)) }
  })
server.tool("generate", "Generate random user profiles.", { count: z.number().describe("How many profiles.").optional(), gender: z.string().describe("male, female, or any.").optional(), nat: z.string().describe("Nationality code, for example us or gb.").optional() }, async (args) => {
    try { return text(await m1_generate(args)) } catch (e) { return text(error(e)) }
  })
server.tool("seed", "Generate the same profiles every time with a seed.", { seed: z.string().describe("Seed value."), count: z.number().describe("How many profiles.").optional() }, async (args) => {
    try { return text(await m1_seed(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
