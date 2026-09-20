import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { formatExtension, formatHit, getExtension, OpenVsxError, searchExtensions } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "open-vsx-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "search_extensions",
    {
      title: "Search extensions",
      description: "Search Open VSX for VS Code extensions: descriptions, download counts.",
      inputSchema: z.object({
        query: z.string().describe("Search text, e.g. 'python', 'vim', 'theme'"),
        limit: z.number().int().min(1).max(50).default(5),
      }),
      annotations: READ_ONLY,
    },
    async ({ query, limit }) => {
      try {
        const results = await searchExtensions(query, limit)
        if (results.length === 0) return text(`No Open VSX extensions match "${query}".`)
        return text(`Open VSX results for "${query}":\n\n${results.map((e, i) => formatHit(e, i)).join("\n")}`)
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "get_extension",
    {
      title: "Get extension details",
      description: "Get an Open VSX extension: version, license, links, recent versions.",
      inputSchema: z.object({
        namespace: z.string().describe("Publisher namespace, e.g. 'rust-lang' (case-sensitive)"),
        name: z.string().describe("Extension name, e.g. 'rust-analyzer' (case-sensitive)"),
      }),
      annotations: READ_ONLY,
    },
    async ({ namespace, name }) => {
      try {
        return text(formatExtension(await getExtension(namespace, name)))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof OpenVsxError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
