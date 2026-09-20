import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { extract, format, searchTitles } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const errorText = (error: unknown) => text(`Error: ${error instanceof Error ? error.message : String(error)}`)

export function createServer() {
  const server = new McpServer({ name: "wikisource-mcp", version: "1.0.0" })
  server.registerTool(
    "search_texts",
    {
      title: "Search texts",
      description: "Search Wikisource titles and snippets for texts and primary sources hosted on the project.",
      inputSchema: z.object( { query: z.string().min(1).max(200), limit: z.number().int().min(1).max(25).default(10) }),
      annotations: READ_ONLY,
    },
    async ({ query, limit }) => {
    try { return text(format(await searchTitles(query, limit))) } catch (error) { return errorText(error) }
  }
  )
  server.registerTool(
    "read_text",
    {
      title: "Read text",
      description: "Read a bounded plain-text extract from a Wikisource page. Verify the page's rights and edition before reuse.",
      inputSchema: z.object( { title: z.string().min(1).max(300), introOnly: z.boolean().default(true), maxCharacters: z.number().int().min(200).max(12000).default(4000) }),
      annotations: READ_ONLY,
    },
    async ({ title, introOnly, maxCharacters }) => {
    try { return text(format(await extract(title, introOnly, maxCharacters))) } catch (error) { return errorText(error) }
  }
  )
  return server
}
