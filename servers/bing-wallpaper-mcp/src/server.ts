import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { recent } from "./api.js"
import { today } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "bing-wallpaper-mcp", version: "1.0.0" })
  server.tool("today", "Today Bing wallpaper.", {  }, async (args) => {
    try { return text(await today(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("recent", "Recent Bing wallpapers.", { count: z.number().describe("How many days back.").optional() }, async (args) => {
    try { return text(await recent(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
