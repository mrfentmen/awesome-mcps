import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_ArchiveError, m0_fmtSize, m0_formatItem, m0_getItemDetails, m0_searchItems, m1_WaybackError, m1_formatSnapshot, m1_getAvailability, m1_getSnapshots, m1_getSnapshotText } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'archive-org-mcp', version: '1.0.0' })
server.registerTool(
    "search_items",
    {
      title: "Search items",
      description: "Search the Internet Archive — old software, abandoned CD-ROM games, " +
      "bootleg concert tapes, 78rpm records, dead web pages, and more.",
      inputSchema: z.object(
    {
      query: z.string().describe("Search query, e.g. 'Windows 95' or 'sonic hedgehog prototype'"),
      mediatype: z
        .enum(["software", "audio", "movies", "texts", "image", "web"])
        .optional()
        .describe("Restrict to a media type"),
      limit: z.number().int().min(1).max(25).default(8),
    }),
      annotations: READ_ONLY,
    },
    async ({ query, mediatype, limit }) => {
      try {
        const items = await m0_searchItems(query, mediatype, limit)
        if (items.length === 0) return text(`Nothing in the Archive matches "${query}".`)
        return text(
          `Archive.org results for "${query}"${mediatype ? ` (${mediatype})` : ""}:\n\n` +
            items.map((it, i) => m0_formatItem(it, i)).join("\n\n")
        )
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )
server.registerTool(
    "get_item",
    {
      title: "Get item",
      description: "Get full details + file manifest for an archive.org item.",
      inputSchema: z.object(
    { identifier: z.string().describe("Item identifier from search_items") }),
      annotations: READ_ONLY,
    },
    async ({ identifier }) => {
      try {
        const d = await m0_getItemDetails(identifier)
        const lines = [
          d.title ?? d.identifier,
          d.mediatype ? `Type: ${d.mediatype}` : "",
          d.description ? d.description.slice(0, 400) : "",
          `https://archive.org/details/${d.identifier}`,
          "",
          `Files (${d.files.length} shown):`,
          ...d.files.map(
            (f, i) =>
              `${i + 1}. ${f.name}${f.format ? ` [${f.format}]` : ""}${f.size ? ` ${m0_fmtSize(f.size)}` : ""}${f.length ? ` (${f.length})` : ""}`
          ),
        ].filter(Boolean)
        return text(lines.join("\n"))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )
server.registerTool(
    "get_snapshots",
    {
      title: "Get snapshots",
      description: "List the Wayback Machine snapshot history for a URL.",
      inputSchema: z.object(
    { url: z.string().describe("Full URL, e.g. 'example.com/page.html'"), limit: z.number().int().min(1).max(25).default(10) }),
      annotations: READ_ONLY,
    },
    async ({ url, limit }) => {
      try {
        const snaps = await m1_getSnapshots(url, limit)
        if (snaps.length === 0) return text(`No archived snapshots of ${url}.`)
        return text(`Snapshots of ${url}:\n\n${snaps.map((s, i) => m1_formatSnapshot(s, i)).join("\n\n")}`)
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )
server.registerTool(
    "get_availability",
    {
      title: "Get availability",
      description: "Check whether a page is archived and get its closest snapshot.",
      inputSchema: z.object(
    { url: z.string().describe("Full URL") }),
      annotations: READ_ONLY,
    },
    async ({ url }) => {
      try {
        const snap = await m1_getAvailability(url)
        if (!snap) return text(`No archived snapshot of ${url}.`)
        return text(`Closest snapshot of ${url}:\n\n${m1_formatSnapshot(snap)}`)
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )
server.registerTool(
    "read_snapshot",
    {
      title: "Read snapshot",
      description: "Read the text content of an archived page, for reading dead sites.",
      inputSchema: z.object(
    {
      timestamp: z.string().describe("Snapshot timestamp from get_snapshots, e.g. '20240101120000'"),
      url: z.string().describe("The original URL that was archived"),
      maxChars: z.number().int().min(500).max(50000).default(15000),
    }),
      annotations: READ_ONLY,
    },
    async ({ timestamp, url, maxChars }) => {
      try {
        const content = await m1_getSnapshotText(timestamp, url, maxChars)
        if (!content.trim()) return text(`Snapshot ${timestamp} of ${url} has no readable text.`)
        return text(content)
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )
  return server
}
