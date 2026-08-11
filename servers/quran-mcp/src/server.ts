import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { verse, surahInfo, chapters, chapter } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: 'quran-mcp', version: '1.0.0' })
  server.tool('verse', 'Quran verse in Arabic and English from alQuran.cloud.', { chapter: z.number().describe('Surah number 1 to 114.').optional(), verse: z.number().describe('Verse number.').optional() }, async (args) => {
    try { return text(await verse(args)) } catch (e) { return text(error(e)) }
  })
  server.tool('surahInfo', 'Surah overview from alQuran.cloud.', { chapter: z.number().describe('Surah number 1 to 114.').optional() }, async (args) => {
    try { return text(await surahInfo(args)) } catch (e) { return text(error(e)) }
  })
  server.tool('chapters', 'List all 114 chapters from Quran.com.', {}, async () => {
    try { return text(await chapters()) } catch (e) { return text(error(e)) }
  })
  server.tool('chapter', 'Chapter details from Quran.com.', { id: z.number().describe('Chapter id.').optional() }, async (args) => {
    try { return text(await chapter(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
