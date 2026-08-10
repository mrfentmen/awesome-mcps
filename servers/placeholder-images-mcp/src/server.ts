import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { imageUrl } from "./api.js"
import { listImages } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "placeholder-images-mcp", version: "1.0.0" })
  server.tool("image_url", "Get a placeholder image URL.", { width: z.number().describe("Image width.").optional(), height: z.number().describe("Image height.").optional(), seed: z.string().describe("Stable seed string.").optional() }, async (args) => {
    try { return text(await imageUrl(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("list_images", "List available placeholder images.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await listImages(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
