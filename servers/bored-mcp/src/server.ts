import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { activityByParticipants } from "./api.js"
import { activityByType } from "./api.js"
import { randomActivity } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "bored-mcp", version: "1.0.0" })
  server.registerTool(
    "random_activity",
    {
      title: "Random activity",
      description: "Get a random activity.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await randomActivity(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "activity_by_type",
    {
      title: "Activity by type",
      description: "Get an activity of a type.",
      inputSchema: z.object( { type: z.string().describe("Activity type (education, recreational, social, diy, charity, cooking, relaxation, music, busywork).") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await activityByType(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "activity_by_participants",
    {
      title: "Activity by participants",
      description: "Get an activity for N participants.",
      inputSchema: z.object( { participants: z.number().describe("Number of participants.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await activityByParticipants(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
