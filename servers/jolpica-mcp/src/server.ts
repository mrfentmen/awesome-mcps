import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { current } from "./api.js"
import { drivers } from "./api.js"
import { races } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "jolpica-mcp", version: "1.0.0" })
  server.tool("current", "Current F1 season summary.", {  }, async (args) => {
    try { return text(await current(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("races", "Races in a season.", { year: z.number().describe("Season year.").optional() }, async (args) => {
    try { return text(await races(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("drivers", "Drivers in a season.", { year: z.number().describe("Season year.").optional() }, async (args) => {
    try { return text(await drivers(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
