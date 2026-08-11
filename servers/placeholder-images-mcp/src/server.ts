import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_imageUrl, m0_listImages, m1_list } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'placeholder-images-mcp', version: '1.0.0' })
server.tool("image_url", "Get a placeholder image URL.", { width: z.number().describe("Image width.").optional(), height: z.number().describe("Image height.").optional(), seed: z.string().describe("Stable seed string.").optional() }, async (args) => {
    try { return text(await m0_imageUrl(args)) } catch (e) { return text(error(e)) }
  })
server.tool("list_images", "List available placeholder images.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m0_listImages(args)) } catch (e) { return text(error(e)) }
  })
server.tool("list", "List recent Picsum photos.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m1_list(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
