import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { repoDetail } from "./api.js"
import { searchRepos } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "gitea-mcp", version: "1.0.0" })
  server.tool("search_repos", "Search public repositories.", { query: z.string().describe("Search query."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await searchRepos(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("repo_detail", "Get repository details.", { owner: z.string().describe("Owner name."), repo: z.string().describe("Repository name.") }, async (args) => {
    try { return text(await repoDetail(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
