import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { apod } from "./api.js"
import { marsPhotos } from "./api.js"
import { neo } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "nasa-mcp", version: "1.0.0" })
  server.tool("get_apod", "Get the astronomy picture of the day with explanation.", {  }, async (args) => {
    try { return text(await apod(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("get_neo", "Get near earth objects within a date range.", { start_date: z.string().describe("Start date YYYY-MM-DD.").optional(), end_date: z.string().describe("End date YYYY-MM-DD.").optional() }, async (args) => {
    try { return text(await neo(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("get_mars_photos", "Get Mars rover photos by rover, sol, or camera.", { rover: z.string().describe("Rover name like curiosity or perseverance.").optional(), sol: z.number().describe("Martian sol.").optional(), camera: z.string().describe("Camera abbreviation like FHAZ.").optional() }, async (args) => {
    try { return text(await marsPhotos(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
