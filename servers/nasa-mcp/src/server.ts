import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_apod, m0_marsPhotos, m0_neo, m1_latestWeather, m2_browse, m3_photos, m4_project } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'nasa-mcp', version: '1.0.0' })
server.registerTool(
    "get_apod",
    {
      title: "Get apod",
      description: "Get the astronomy picture of the day with explanation.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m0_apod(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "get_neo",
    {
      title: "Get neo",
      description: "Get near earth objects within a date range.",
      inputSchema: z.object( { start_date: z.string().describe("Start date YYYY-MM-DD.").optional(), end_date: z.string().describe("End date YYYY-MM-DD.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m0_neo(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "get_mars_photos",
    {
      title: "Get mars photos",
      description: "Get Mars rover photos by rover, sol, or camera.",
      inputSchema: z.object( { rover: z.string().describe("Rover name like curiosity or perseverance.").optional(), sol: z.number().describe("Martian sol.").optional(), camera: z.string().describe("Camera abbreviation like FHAZ.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m0_marsPhotos(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "latest_weather",
    {
      title: "Latest weather",
      description: "Latest Mars weather report from InSight.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m1_latestWeather(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "browse",
    {
      title: "Browse",
      description: "Browse near earth objects.",
      inputSchema: z.object( { limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m2_browse(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "photos",
    {
      title: "Photos",
      description: "Mars rover photos for a sol.",
      inputSchema: z.object( { rover: z.string().describe("Rover name like curiosity.").optional(), sol: z.number().describe("Martian sol."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m3_photos(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "project",
    {
      title: "Project",
      description: "One NASA TechPort project.",
      inputSchema: z.object( { id: z.number().describe("Project ID.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m4_project(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
