import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { formatPackage, formatRelease, getPackage, getRelease, HexError } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "hex-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "get_package",
    {
      title: "Get package info",
      description: "Get a Hex package: description, latest version, downloads, docs, licenses, releases.",
      inputSchema: z.object({
        name: z.string().describe("Package name, e.g. 'phoenix'"),
      }),
      annotations: READ_ONLY,
    },
    async ({ name }) => {
      try {
        return text(formatPackage(await getPackage(name)))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "get_release",
    {
      title: "Get release details",
      description: "Get one Hex release: publish date, checksum, requirements.",
      inputSchema: z.object({
        name: z.string().describe("Package name, e.g. 'phoenix'"),
        version: z.string().describe("Version, e.g. '1.7.0' (use get_package to find it)"),
      }),
      annotations: READ_ONLY,
    },
    async ({ name, version }) => {
      try {
        return text(formatRelease(name, await getRelease(name, version)))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof HexError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
