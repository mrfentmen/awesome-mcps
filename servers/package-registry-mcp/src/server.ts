import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { npmPackage } from "./api.js"
import { npmSearch } from "./api.js"
import { pypiPackage } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "package-registry-mcp", version: "1.0.0" })
  server.registerTool(
    "npm_package",
    {
      title: "Npm package",
      description: "Look up an npm package by name.",
      inputSchema: z.object( { name: z.string().describe("Package name.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await npmPackage(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "pypi_package",
    {
      title: "Pypi package",
      description: "Look up a PyPI package by name.",
      inputSchema: z.object( { name: z.string().describe("Package name.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await pypiPackage(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "npm_search",
    {
      title: "Npm search",
      description: "Search npm packages by keyword.",
      inputSchema: z.object( { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await npmSearch(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
