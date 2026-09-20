import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { instance } from "./api.js"
import { trends } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "mastodon-mcp", version: "1.0.0" })
  server.registerTool(
    "instance",
    {
      title: "Instance",
      description: "Public info for one instance.",
      inputSchema: z.object( { domain: z.string().describe("Instance domain.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await instance(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "trends",
    {
      title: "Trends",
      description: "Trending tags on one instance.",
      inputSchema: z.object( { domain: z.string().describe("Instance domain.").optional(), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await trends(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
