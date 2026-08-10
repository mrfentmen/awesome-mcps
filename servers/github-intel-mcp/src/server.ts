import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { repo } from "./api.js"
import { searchRepos } from "./api.js"
import { userRepos } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "github-intel-mcp", version: "1.0.0" })
  server.tool("search_repos", "Search GitHub repositories by query sorted by stars.", { query: z.string().describe("Search query."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await searchRepos(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("get_repo", "Get details for one repository.", { owner: z.string().describe("Owner name."), repo: z.string().describe("Repository name.") }, async (args) => {
    try { return text(await repo(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("get_user_repos", "List repositories for a GitHub user.", { username: z.string().describe("GitHub username."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await userRepos(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
