import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { TetrisError, getPage, searchPages, wikiTextToPlain } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "tetriswiki-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "search_pages",
    {
      title: "Search pages",
      description: "Search the Tetris wiki for games, pieces, and techniques.",
      inputSchema: z.object(
    { query: z.string().describe("Search terms, e.g. 'T-spin' or 'Tetris Attack'") }),
      annotations: READ_ONLY,
    },
    async ({ query }) => {
      try {
        const pages = await searchPages(query)
        if (pages.length === 0) return text(`No Tetris wiki pages match "${query}".`)
        return text(
          `Tetris wiki results for "${query}":\n\n` +
            pages
              .map(
                (p, i) =>
                  `${i + 1}. ${p.title}\n   ${p.snippet ?? ""}\n   https://tetris.wiki/${encodeURIComponent(p.title).replace(/%2F/g, "/")}`
              )
              .join("\n\n")
        )
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "get_page",
    {
      title: "Get page",
      description: "Read a Tetris wiki page as plain text.",
      inputSchema: z.object(
    {
      title: z.string().describe("Exact page title from search_pages"),
      maxChars: z.number().int().min(500).max(30000).default(12000),
    }),
      annotations: READ_ONLY,
    },
    async ({ title, maxChars }) => {
      try {
        const page = await getPage(title)
        if (!page) return text(`No Tetris wiki page "${title}".`)
        const plain = wikiTextToPlain(page.wikitext, maxChars)
        return text(`${page.title}\n${page.url}\n\n${plain || "(no readable content)"}`)
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof TetrisError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
