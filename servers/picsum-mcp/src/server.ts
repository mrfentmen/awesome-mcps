import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { formatPhoto, getPhoto, listPhotos, photoUrl, PicsumError } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "picsum-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "list_photos",
    {
      title: "List photos",
      description: "Browse Picsum placeholder photos: ids, authors, dimensions.",
      inputSchema: z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(5),
      }),
      annotations: READ_ONLY,
    },
    async ({ page, limit }) => {
      try {
        const results = await listPhotos(page, limit)
        if (results.length === 0) return text("No photos on this page.")
        return text(results.map((p, i) => formatPhoto(p, i)).join("\n"))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "get_photo",
    {
      title: "Get photo info",
      description: "Get one Picsum photo: author, dimensions, page link.",
      inputSchema: z.object({
        id: z.string().describe("Numeric photo id, e.g. '0'"),
      }),
      annotations: READ_ONLY,
    },
    async ({ id }) => {
      try {
        return text(formatPhoto(await getPhoto(id)))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "photo_url",
    {
      title: "Photo image URL",
      description: "Build a direct Picsum image URL at any size, with optional grayscale and blur. No fetching needed.",
      inputSchema: z.object({
        id: z.string().describe("Numeric photo id, e.g. '0'"),
        width: z.number().int().min(1).max(5000).default(800),
        height: z.number().int().min(1).max(5000).default(600),
        grayscale: z.boolean().default(false),
        blur: z.number().int().min(0).max(10).default(0).describe("Blur amount 1-10, 0 = none"),
      }),
      annotations: READ_ONLY,
    },
    async ({ id, width, height, grayscale, blur }) => {
      try {
        return text(photoUrl(id, width, height, grayscale, blur))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof PicsumError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
