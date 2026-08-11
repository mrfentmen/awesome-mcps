import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_convert, m0_current, m1_listZones, m1_timeInZone } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'timeapi-mcp', version: '1.0.0' })
server.tool("current", "Current time in a zone.", { zone: z.string().describe("IANA zone like Europe/London.") }, async (args) => {
    try { return text(await m0_current(args)) } catch (e) { return text(error(e)) }
  })
server.tool("convert", "Convert time between zones.", { from: z.string().describe("Source IANA zone."), to: z.string().describe("Target IANA zone."), datetime: z.string().describe("ISO datetime.").optional() }, async (args) => {
    try { return text(await m0_convert(args)) } catch (e) { return text(error(e)) }
  })
server.tool("time_in_zone", "Get the current time in an IANA timezone.", { timezone: z.string().describe("IANA timezone like America/New_York.") }, async (args) => {
    try { return text(await m1_timeInZone(args)) } catch (e) { return text(error(e)) }
  })
server.tool("list_zones", "List common IANA timezones.", {  }, async (args) => {
    try { return text(await m1_listZones(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
