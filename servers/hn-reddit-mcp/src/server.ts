import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { hnItem } from "./api.js"
import { hnTop } from "./api.js"
import { redditTop } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "hn-reddit-mcp", version: "1.0.0" })
  server.registerTool(
    "get_hn_top",
    {
      title: "Get hn top",
      description: "Get top Hacker News stories.",
      inputSchema: z.object( { limit: z.number().describe("Max stories.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await hnTop(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "get_hn_item",
    {
      title: "Get hn item",
      description: "Get one Hacker News item by id.",
      inputSchema: z.object( { item_id: z.number().describe("Hacker News item id.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await hnItem(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "get_reddit_top",
    {
      title: "Get reddit top",
      description: "Get top posts from a subreddit.",
      inputSchema: z.object( { subreddit: z.string().describe("Subreddit name without the r slash."), limit: z.number().describe("Max posts.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await redditTop(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
