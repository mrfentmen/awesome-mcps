import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_publicHolidays, m0_nextHolidays, m0_countries, m0_openHolidays, m1_holidays } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'holidays-mcp', version: '1.0.0' })
server.tool('publicHolidays', 'Public holidays for a country and year from Nager.Date.', { year: z.number().describe('Year.').optional(), country: z.string().describe('ISO country code, default US.').optional() }, async (args) => {
    try { return text(await m0_publicHolidays(args)) } catch (e) { return text(error(e)) }
  })
server.tool('nextHolidays', 'Upcoming public holidays from Nager.Date.', { country: z.string().describe('ISO country code, default US.').optional(), limit: z.number().describe('Max results.').optional() }, async (args) => {
    try { return text(await m0_nextHolidays(args)) } catch (e) { return text(error(e)) }
  })
server.tool('countries', 'List countries supported by Open Holidays.', {}, async () => {
    try { return text(await m0_countries()) } catch (e) { return text(error(e)) }
  })
server.tool('openHolidays', 'Public holidays for a country and year from Open Holidays.', { country: z.string().describe('ISO country code.').optional(), year: z.number().describe('Year.').optional() }, async (args) => {
    try { return text(await m0_openHolidays(args)) } catch (e) { return text(error(e)) }
  })
server.tool("holidays", "Public holidays for a country and year.", { country: z.string().describe("Country code."), year: z.number().describe("Year.") }, async (args) => {
    try { return text(await m1_holidays(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
