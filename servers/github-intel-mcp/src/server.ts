import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { repo } from "./api.js"
import { searchRepos } from "./api.js"
import { userRepos } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "github-intel-mcp", version: "1.0.0" })
  server.registerTool(
    "search_repos",
    {
      title: "Search repos",
      description: "Search GitHub repositories by query sorted by stars.",
      inputSchema: z.object( { query: z.string().describe("Search query."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await searchRepos(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "get_repo",
    {
      title: "Get repo",
      description: "Get details for one repository.",
      inputSchema: z.object( { owner: z.string().describe("Owner name."), repo: z.string().describe("Repository name.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await repo(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "get_user_repos",
    {
      title: "Get user repos",
      description: "List repositories for a GitHub user.",
      inputSchema: z.object( { username: z.string().describe("GitHub username."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await userRepos(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
