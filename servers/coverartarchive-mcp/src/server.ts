import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { CoverArtError, formatCover, frontUrl, getCover } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "coverartarchive-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "get_cover",
    {
      title: "Get cover art",
      description: "Get archived cover art for a MusicBrainz release or release-group: front/back URLs, thumbnails, image count.",
      inputSchema: z.object({
        mbid: z.string().describe("MusicBrainz ID, e.g. '76df3287-6cda-33eb-8e9a-044b5e15ffdd' (find it with musicbrainz-mcp)"),
        kind: z.enum(["release", "release-group"]).default("release"),
      }),
      annotations: READ_ONLY,
    },
    async ({ mbid, kind }) => {
      try {
        return text(formatCover(await getCover(mbid, kind)))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "front_url",
    {
      title: "Front cover URL",
      description: "Build a direct front-cover image URL for a MusicBrainz ID without fetching. Useful for embedding artwork.",
      inputSchema: z.object({
        mbid: z.string().describe("MusicBrainz release or release-group MBID"),
        kind: z.enum(["release", "release-group"]).default("release"),
        size: z.enum(["250", "500", "1200"]).default("500").describe("Thumbnail size in px"),
      }),
      annotations: READ_ONLY,
    },
    async ({ mbid, kind, size }) => {
      try {
        return text(frontUrl(mbid, kind, Number(size) as 250 | 500 | 1200))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof CoverArtError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
