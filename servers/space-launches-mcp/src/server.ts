import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_nextLaunch, m0_upcomingLaunches, m1_list, m2_previous, m2_upcoming } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'space-launches-mcp', version: '1.0.0' })
server.registerTool(
    "upcoming_launches",
    {
      title: "Upcoming launches",
      description: "List upcoming rocket launches.",
      inputSchema: z.object( { limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m0_upcomingLaunches(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "next_launch",
    {
      title: "Next launch",
      description: "Get the next scheduled launch.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m0_nextLaunch(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "list",
    {
      title: "List",
      description: "Astronaut profiles.",
      inputSchema: z.object( { limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m1_list(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "upcoming",
    {
      title: "Upcoming",
      description: "Upcoming launches.",
      inputSchema: z.object( { limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m2_upcoming(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "previous",
    {
      title: "Previous",
      description: "Previous launches.",
      inputSchema: z.object( { limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m2_previous(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
