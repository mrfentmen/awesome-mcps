import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { imageInfo } from "./api.js"
import { searchImages } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "docker-hub-mcp", version: "1.0.0" })
  server.registerTool(
    "image_info",
    {
      title: "Image info",
      description: "Get details for a Docker image.",
      inputSchema: z.object( { name: z.string().describe("Image name like library/nginx.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await imageInfo(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "search_images",
    {
      title: "Search images",
      description: "Search Docker Hub images.",
      inputSchema: z.object( { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await searchImages(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
