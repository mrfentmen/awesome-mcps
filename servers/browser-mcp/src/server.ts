import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { openPage } from "./api.js"
import { screenshotPage } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "browser-mcp", version: "1.0.0" })
  server.registerTool(
    "open_page",
    {
      title: "Open page",
      description: "Open a URL in headless Chrome and return the title and a text sample.",
      inputSchema: z.object( { url: z.string().describe("Full URL to open.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await openPage(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "screenshot_page",
    {
      title: "Screenshot page",
      description: "Take a screenshot of a URL and save it to a local file.",
      inputSchema: z.object( { url: z.string().describe("Full URL to capture.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await screenshotPage(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
