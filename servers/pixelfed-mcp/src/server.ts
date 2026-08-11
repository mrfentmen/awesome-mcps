import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { instance } from "./api.js"
import { publicTimeline } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "pixelfed-mcp", version: "1.0.0" })
  server.tool("instance", "Get Pixelfed instance info.", { instance: z.string().describe("Instance host like pixelfed.social.").optional() }, async (args) => {
    try { return text(await instance(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("public_timeline", "Get public posts.", { instance: z.string().describe("Instance host.").optional(), limit: z.number().describe("Max posts.").optional() }, async (args) => {
    try { return text(await publicTimeline(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
