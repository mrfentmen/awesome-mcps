import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { nextHolidays } from "./api.js"
import { publicHolidays } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "holidays-mcp", version: "1.0.0" })
  server.tool("public_holidays", "List public holidays for a country and year.", { year: z.number().describe("Year."), country: z.string().describe("Two letter country code.") }, async (args) => {
    try { return text(await publicHolidays(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("next_holidays", "List the next public holidays for a country.", { country: z.string().describe("Two letter country code."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await nextHolidays(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
