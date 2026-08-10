import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { chapterInfo } from "./api.js"
import { verse } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "quran-mcp", version: "1.0.0" })
  server.tool("verse", "Get a Quran verse by chapter and number.", { chapter: z.number().describe("Chapter number 1 to 114."), verse: z.number().describe("Verse number.") }, async (args) => {
    try { return text(await verse(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("chapter_info", "Get details for a Quran chapter.", { chapter: z.number().describe("Chapter number 1 to 114.") }, async (args) => {
    try { return text(await chapterInfo(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
