import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_issNow, m0_issPasses, m1_position } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'iss-mcp', version: '1.0.0' })
server.registerTool(
    "iss_now",
    {
      title: "Iss now",
      description: "Current ISS position, altitude, and velocity.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m0_issNow(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "iss_passes",
    {
      title: "Iss passes",
      description: "Upcoming ISS passes over a location.",
      inputSchema: z.object( { lat: z.number().describe("Latitude."), lon: z.number().describe("Longitude."), days: z.number().describe("Days to look ahead.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m0_issPasses(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "position",
    {
      title: "Position",
      description: "Current ISS position.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m1_position(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
