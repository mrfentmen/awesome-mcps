import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_caption, m0_templates } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'meme-generator-mcp', version: '1.0.0' })
server.tool("templates", "List popular meme templates.", { limit: z.number().describe("Maximum results.").optional() }, async (args) => {
    try { return text(await m0_templates(args)) } catch (e) { return text(error(e)) }
  })
server.tool("caption", "Build a caption URL for a template.", { template_id: z.string().describe("The Imgflip template ID."), top: z.string().describe("Top caption.").optional(), bottom: z.string().describe("Bottom caption.").optional() }, async (args) => {
    try { return text(await m0_caption(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
