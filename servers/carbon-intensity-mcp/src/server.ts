import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { forecast } from "./api.js"
import { intensity } from "./api.js"
import { regional } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "carbon-intensity-mcp", version: "1.0.0" })
  server.tool("intensity", "Current UK grid carbon intensity.", {  }, async (args) => {
    try { return text(await intensity(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("forecast", "Carbon intensity forecast for the next 48 hours.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await forecast(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("regional", "Carbon intensity by region.", {  }, async (args) => {
    try { return text(await regional(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
