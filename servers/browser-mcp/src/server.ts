import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { openPage } from "./api.js"
import { screenshotPage } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "browser-mcp", version: "1.0.0" })
  server.tool("open_page", "Open a URL in headless Chrome and return the title and a text sample.", { url: z.string().describe("Full URL to open.") }, async (args) => {
    try { return text(await openPage(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("screenshot_page", "Take a screenshot of a URL and save it to a local file.", { url: z.string().describe("Full URL to capture.") }, async (args) => {
    try { return text(await screenshotPage(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
