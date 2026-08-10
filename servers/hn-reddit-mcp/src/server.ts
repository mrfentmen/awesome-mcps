import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { hnItem } from "./api.js"
import { hnTop } from "./api.js"
import { redditTop } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "hn-reddit-mcp", version: "1.0.0" })
  server.tool("get_hn_top", "Get top Hacker News stories.", { limit: z.number().describe("Max stories.").optional() }, async (args) => {
    try { return text(await hnTop(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("get_hn_item", "Get one Hacker News item by id.", { item_id: z.number().describe("Hacker News item id.") }, async (args) => {
    try { return text(await hnItem(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("get_reddit_top", "Get top posts from a subreddit.", { subreddit: z.string().describe("Subreddit name without the r slash."), limit: z.number().describe("Max posts.").optional() }, async (args) => {
    try { return text(await redditTop(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
