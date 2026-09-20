import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_convert, m0_current, m1_listZones, m1_timeInZone } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'timeapi-mcp', version: '1.0.0' })
server.registerTool(
    "current",
    {
      title: "Current",
      description: "Current time in a zone.",
      inputSchema: z.object( { zone: z.string().describe("IANA zone like Europe/London.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m0_current(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "convert",
    {
      title: "Convert",
      description: "Convert time between zones.",
      inputSchema: z.object( { from: z.string().describe("Source IANA zone."), to: z.string().describe("Target IANA zone."), datetime: z.string().describe("ISO datetime.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m0_convert(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "time_in_zone",
    {
      title: "Time in zone",
      description: "Get the current time in an IANA timezone.",
      inputSchema: z.object( { timezone: z.string().describe("IANA timezone like America/New_York.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m1_timeInZone(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "list_zones",
    {
      title: "List zones",
      description: "List common IANA timezones.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m1_listZones(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
