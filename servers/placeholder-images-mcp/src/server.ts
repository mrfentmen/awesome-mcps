import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_imageUrl, m0_listImages, m1_list } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'placeholder-images-mcp', version: '1.0.0' })
server.registerTool(
    "image_url",
    {
      title: "Image url",
      description: "Get a placeholder image URL.",
      inputSchema: z.object( { width: z.number().describe("Image width.").optional(), height: z.number().describe("Image height.").optional(), seed: z.string().describe("Stable seed string.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m0_imageUrl(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "list_images",
    {
      title: "List images",
      description: "List available placeholder images.",
      inputSchema: z.object( { limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m0_listImages(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "list",
    {
      title: "List",
      description: "List recent Picsum photos.",
      inputSchema: z.object( { limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m1_list(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
