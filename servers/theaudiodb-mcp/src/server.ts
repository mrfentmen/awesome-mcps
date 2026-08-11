import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_album, m0_artist, m1_track } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'theaudiodb-mcp', version: '1.0.0' })
server.tool("artist", "Search artists by name.", { name: z.string().describe("Artist name.") }, async (args) => {
    try { return text(await m0_artist(args)) } catch (e) { return text(error(e)) }
  })
server.tool("album", "Albums by artist.", { artist: z.string().describe("Artist name.") }, async (args) => {
    try { return text(await m0_album(args)) } catch (e) { return text(error(e)) }
  })
server.tool("track", "Details for one track by ID.", { id: z.number().describe("Track ID.") }, async (args) => {
    try { return text(await m1_track(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
