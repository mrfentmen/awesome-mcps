import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { createEvent } from "./api.js"
import { createReminder } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const WRITE = { readOnlyHint: false, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "ics-generator-mcp", version: "1.0.0" })
  server.registerTool(
    "create_event",
    {
      title: "Create event",
      description: "Create an ics calendar event from a title, dates, and details.",
      inputSchema: z.object( { title: z.string().describe("Event title."), start: z.string().describe("Start time in ISO format."), end: z.string().describe("End time in ISO format.").optional(), description: z.string().describe("Event description.").optional(), location: z.string().describe("Event location.").optional(), filename: z.string().describe("Output file name.").optional() }),
      annotations: WRITE,
    },
    async (args) => {
    try { return text(await createEvent(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "create_reminder",
    {
      title: "Create reminder",
      description: "Create an all day reminder event from a date.",
      inputSchema: z.object( { title: z.string().describe("Reminder title."), date: z.string().describe("Date in YYYY-MM-DD format.") }),
      annotations: WRITE,
    },
    async (args) => {
    try { return text(await createReminder(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
