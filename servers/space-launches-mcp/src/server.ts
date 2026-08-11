import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_nextLaunch, m0_upcomingLaunches, m1_list, m2_previous, m2_upcoming } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'space-launches-mcp', version: '1.0.0' })
server.tool("upcoming_launches", "List upcoming rocket launches.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m0_upcomingLaunches(args)) } catch (e) { return text(error(e)) }
  })
server.tool("next_launch", "Get the next scheduled launch.", {  }, async (args) => {
    try { return text(await m0_nextLaunch(args)) } catch (e) { return text(error(e)) }
  })
server.tool("list", "Astronaut profiles.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m1_list(args)) } catch (e) { return text(error(e)) }
  })
server.tool("upcoming", "Upcoming launches.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m2_upcoming(args)) } catch (e) { return text(error(e)) }
  })
server.tool("previous", "Previous launches.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m2_previous(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
