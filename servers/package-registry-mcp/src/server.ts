import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { npmPackage } from "./api.js"
import { npmSearch } from "./api.js"
import { pypiPackage } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "package-registry-mcp", version: "1.0.0" })
  server.tool("npm_package", "Look up an npm package by name.", { name: z.string().describe("Package name.") }, async (args) => {
    try { return text(await npmPackage(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("pypi_package", "Look up a PyPI package by name.", { name: z.string().describe("Package name.") }, async (args) => {
    try { return text(await pypiPackage(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("npm_search", "Search npm packages by keyword.", { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await npmSearch(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
