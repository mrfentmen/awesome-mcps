import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { instance } from "./api.js"
import { trends } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "mastodon-mcp", version: "1.0.0" })
  server.tool("instance", "Public info for one instance.", { domain: z.string().describe("Instance domain.").optional() }, async (args) => {
    try { return text(await instance(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("trends", "Trending tags on one instance.", { domain: z.string().describe("Instance domain.").optional(), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await trends(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
