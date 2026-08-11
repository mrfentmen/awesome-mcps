import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_ArchiveError, m0_fmtSize, m0_formatItem, m0_getItemDetails, m0_searchItems, m1_WaybackError, m1_formatSnapshot, m1_getAvailability, m1_getSnapshots, m1_getSnapshotText } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'archive-org-mcp', version: '1.0.0' })
server.tool(
    "search_items",
    "Search the Internet Archive — old software, abandoned CD-ROM games, " +
      "bootleg concert tapes, 78rpm records, dead web pages, and more.",
    {
      query: z.string().describe("Search query, e.g. 'Windows 95' or 'sonic hedgehog prototype'"),
      mediatype: z
        .enum(["software", "audio", "movies", "texts", "image", "web"])
        .optional()
        .describe("Restrict to a media type"),
      limit: z.number().int().min(1).max(25).default(8),
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
        return text(errorMessage(e))
      }
    }
  )
server.tool(
    "get_item",
    "Get full details + file manifest for an archive.org item.",
    { identifier: z.string().describe("Item identifier from search_items") },
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
        return text(errorMessage(e))
      }
    }
  )
server.tool(
    "get_snapshots",
    "List the Wayback Machine snapshot history for a URL.",
    { url: z.string().describe("Full URL, e.g. 'example.com/page.html'"), limit: z.number().int().min(1).max(25).default(10) },
    async ({ url, limit }) => {
      try {
        const snaps = await m1_getSnapshots(url, limit)
        if (snaps.length === 0) return text(`No archived snapshots of ${url}.`)
        return text(`Snapshots of ${url}:\n\n${snaps.map((s, i) => m1_formatSnapshot(s, i)).join("\n\n")}`)
      } catch (e) {
        return text(errorMessage(e))
      }
    }
  )
server.tool(
    "get_availability",
    "Check whether a page is archived and get its closest snapshot.",
    { url: z.string().describe("Full URL") },
    async ({ url }) => {
      try {
        const snap = await m1_getAvailability(url)
        if (!snap) return text(`No archived snapshot of ${url}.`)
        return text(`Closest snapshot of ${url}:\n\n${m1_formatSnapshot(snap)}`)
      } catch (e) {
        return text(errorMessage(e))
      }
    }
  )
server.tool(
    "read_snapshot",
    "Read the text content of an archived page, for reading dead sites.",
    {
      timestamp: z.string().describe("Snapshot timestamp from get_snapshots, e.g. '20240101120000'"),
      url: z.string().describe("The original URL that was archived"),
      maxChars: z.number().int().min(500).max(50000).default(15000),
    },
    async ({ timestamp, url, maxChars }) => {
      try {
        const content = await m1_getSnapshotText(timestamp, url, maxChars)
        if (!content.trim()) return text(`Snapshot ${timestamp} of ${url} has no readable text.`)
        return text(content)
      } catch (e) {
        return text(errorMessage(e))
      }
    }
  )
  return server
}
