import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { artifact } from "./api.js"
import { search } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "maven-info-mcp", version: "1.0.0" })
  server.tool("search", "Search Maven Central by query.", { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await search(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("artifact", "Details for one artifact.", { groupId: z.string().describe("Group ID."), artifactId: z.string().describe("Artifact ID.") }, async (args) => {
    try { return text(await artifact(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
