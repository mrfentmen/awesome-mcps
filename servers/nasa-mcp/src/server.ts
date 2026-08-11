import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_apod, m0_marsPhotos, m0_neo, m1_latestWeather, m2_browse, m3_photos, m4_project } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'nasa-mcp', version: '1.0.0' })
server.tool("get_apod", "Get the astronomy picture of the day with explanation.", {  }, async (args) => {
    try { return text(await m0_apod(args)) } catch (e) { return text(error(e)) }
  })
server.tool("get_neo", "Get near earth objects within a date range.", { start_date: z.string().describe("Start date YYYY-MM-DD.").optional(), end_date: z.string().describe("End date YYYY-MM-DD.").optional() }, async (args) => {
    try { return text(await m0_neo(args)) } catch (e) { return text(error(e)) }
  })
server.tool("get_mars_photos", "Get Mars rover photos by rover, sol, or camera.", { rover: z.string().describe("Rover name like curiosity or perseverance.").optional(), sol: z.number().describe("Martian sol.").optional(), camera: z.string().describe("Camera abbreviation like FHAZ.").optional() }, async (args) => {
    try { return text(await m0_marsPhotos(args)) } catch (e) { return text(error(e)) }
  })
server.tool("latest_weather", "Latest Mars weather report from InSight.", {  }, async (args) => {
    try { return text(await m1_latestWeather(args)) } catch (e) { return text(error(e)) }
  })
server.tool("browse", "Browse near earth objects.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m2_browse(args)) } catch (e) { return text(error(e)) }
  })
server.tool("photos", "Mars rover photos for a sol.", { rover: z.string().describe("Rover name like curiosity.").optional(), sol: z.number().describe("Martian sol."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m3_photos(args)) } catch (e) { return text(error(e)) }
  })
server.tool("project", "One NASA TechPort project.", { id: z.number().describe("Project ID.") }, async (args) => {
    try { return text(await m4_project(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
