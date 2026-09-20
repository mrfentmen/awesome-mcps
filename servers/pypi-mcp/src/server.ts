import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { formatFiles, formatPackage, getPackage, getReleaseFiles, PypiError } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "pypi-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "get_package",
    {
      title: "Get package info",
      description: "Get a PyPI package: latest version, summary, author, license, requirements, recent releases.",
      inputSchema: z.object({
        name: z.string().describe("Package name, e.g. 'requests'"),
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
    "get_release_files",
    {
      title: "Get release files",
      description: "List downloadable files for a specific package version: wheels, sdists, sizes, URLs.",
      inputSchema: z.object({
        name: z.string().describe("Package name, e.g. 'requests'"),
        version: z.string().describe("Version, e.g. '2.34.2' (use get_package to find it)"),
      }),
      annotations: READ_ONLY,
    },
    async ({ name, version }) => {
      try {
        return text(formatFiles(name, version, await getReleaseFiles(name, version)))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof PypiError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
