import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { verse, surahInfo, chapters, chapter } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: 'quran-mcp', version: '1.0.0' })
  server.registerTool(
    'verse',
    {
      title: "Verse",
      description: 'Quran verse in Arabic and English from alQuran.cloud.',
      inputSchema: z.object( { chapter: z.number().describe('Surah number 1 to 114.').optional(), verse: z.number().describe('Verse number.').optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await verse(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    'surahInfo',
    {
      title: "Surah Info",
      description: 'Surah overview from alQuran.cloud.',
      inputSchema: z.object( { chapter: z.number().describe('Surah number 1 to 114.').optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await surahInfo(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    'chapters',
    {
      title: "Chapters",
      description: 'List all 114 chapters from Quran.com.',
      inputSchema: z.object({}),
      annotations: READ_ONLY,
    },
    async () => {
    try { return text(await chapters()) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    'chapter',
    {
      title: "Chapter",
      description: 'Chapter details from Quran.com.',
      inputSchema: z.object( { id: z.number().describe('Chapter id.').optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await chapter(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
