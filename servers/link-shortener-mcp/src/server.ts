import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { expand } from "./api.js"
import { shorten } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "link-shortener-mcp", version: "1.0.0" })
  server.registerTool(
    "shorten",
    {
      title: "Shorten",
      description: "Shorten a URL.",
      inputSchema: z.object( { url: z.string().describe("The URL to shorten.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await shorten(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "expand",
    {
      title: "Expand",
      description: "Expand a short URL.",
      inputSchema: z.object( { url: z.string().describe("The short URL.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await expand(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
