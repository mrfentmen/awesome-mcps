import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { activityByParticipants } from "./api.js"
import { activityByType } from "./api.js"
import { randomActivity } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "bored-mcp", version: "1.0.0" })
  server.tool("random_activity", "Get a random activity.", {  }, async (args) => {
    try { return text(await randomActivity(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("activity_by_type", "Get an activity of a type.", { type: z.string().describe("Activity type (education, recreational, social, diy, charity, cooking, relaxation, music, busywork).") }, async (args) => {
    try { return text(await activityByType(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("activity_by_participants", "Get an activity for N participants.", { participants: z.number().describe("Number of participants.") }, async (args) => {
    try { return text(await activityByParticipants(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
