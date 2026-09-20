import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { instance } from "./api.js"
import { publicTimeline } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "pixelfed-mcp", version: "1.0.0" })
  server.registerTool(
    "instance",
    {
      title: "Instance",
      description: "Get Pixelfed instance info.",
      inputSchema: z.object( { instance: z.string().describe("Instance host like pixelfed.social.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await instance(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "public_timeline",
    {
      title: "Public timeline",
      description: "Get public posts.",
      inputSchema: z.object( { instance: z.string().describe("Instance host.").optional(), limit: z.number().describe("Max posts.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await publicTimeline(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
