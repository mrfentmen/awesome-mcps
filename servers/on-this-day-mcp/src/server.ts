import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { births } from "./api.js"
import { deaths } from "./api.js"
import { events } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "on-this-day-mcp", version: "1.0.0" })
  server.tool("events", "Historic events on a date.", { month: z.number().describe("Month 1 to 12."), day: z.number().describe("Day 1 to 31."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await events(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("births", "Famous births on a date.", { month: z.number().describe("Month 1 to 12."), day: z.number().describe("Day 1 to 31."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await births(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("deaths", "Famous deaths on a date.", { month: z.number().describe("Month 1 to 12."), day: z.number().describe("Day 1 to 31."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await deaths(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
