import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { compare } from "./api.js"
import { describe } from "./api.js"
import { sortVersions } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "semver-mcp", version: "1.0.0" })
  server.tool("compare", "Compare two semantic versions.", { a: z.string().describe("Version A."), b: z.string().describe("Version B.") }, async (args) => {
    try { return text(await compare(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("sort_versions", "Sort a comma separated list of versions.", { versions: z.string().describe("Comma separated versions.") }, async (args) => {
    try { return text(await sortVersions(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("describe", "Describe a version: major, minor, patch, prerelease.", { version: z.string().describe("Version to describe.") }, async (args) => {
    try { return text(await describe(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
