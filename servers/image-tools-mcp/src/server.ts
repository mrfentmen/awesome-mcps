import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { inspectImage } from "./api.js"
import { resizeImage } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "image-tools-mcp", version: "1.0.0" })
  server.tool("resize_image", "Resize a local image to a new width.", { path: z.string().describe("Path to the source image."), width: z.number().describe("New width in pixels."), filename: z.string().describe("Output file name.").optional() }, async (args) => {
    try { return text(await resizeImage(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("inspect_image", "Return format, width, height, and file size of an image.", { path: z.string().describe("Path to the image.") }, async (args) => {
    try { return text(await inspectImage(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
