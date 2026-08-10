import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { createEvent } from "./api.js"
import { createReminder } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "ics-generator-mcp", version: "1.0.0" })
  server.tool("create_event", "Create an ics calendar event from a title, dates, and details.", { title: z.string().describe("Event title."), start: z.string().describe("Start time in ISO format."), end: z.string().describe("End time in ISO format.").optional(), description: z.string().describe("Event description.").optional(), location: z.string().describe("Event location.").optional(), filename: z.string().describe("Output file name.").optional() }, async (args) => {
    try { return text(await createEvent(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("create_reminder", "Create an all day reminder event from a date.", { title: z.string().describe("Reminder title."), date: z.string().describe("Date in YYYY-MM-DD format.") }, async (args) => {
    try { return text(await createReminder(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
