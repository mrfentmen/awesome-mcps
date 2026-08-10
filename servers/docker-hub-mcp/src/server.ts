import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { imageInfo } from "./api.js"
import { searchImages } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "docker-hub-mcp", version: "1.0.0" })
  server.tool("image_info", "Get details for a Docker image.", { name: z.string().describe("Image name like library/nginx.") }, async (args) => {
    try { return text(await imageInfo(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("search_images", "Search Docker Hub images.", { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await searchImages(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
