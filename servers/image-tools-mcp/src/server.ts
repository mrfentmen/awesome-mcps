import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { inspectImage } from "./api.js"
import { resizeImage } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const WRITE = { readOnlyHint: false, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "image-tools-mcp", version: "1.0.0" })
  server.registerTool(
    "resize_image",
    {
      title: "Resize image",
      description: "Resize a local image to a new width.",
      inputSchema: z.object( { path: z.string().describe("Path to the source image."), width: z.number().describe("New width in pixels."), filename: z.string().describe("Output file name.").optional() }),
      annotations: WRITE,
    },
    async (args) => {
    try { return text(await resizeImage(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "inspect_image",
    {
      title: "Inspect image",
      description: "Return format, width, height, and file size of an image.",
      inputSchema: z.object( { path: z.string().describe("Path to the image.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await inspectImage(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
