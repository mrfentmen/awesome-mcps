import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { repoDetail } from "./api.js"
import { searchRepos } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "gitea-mcp", version: "1.0.0" })
  server.registerTool(
    "search_repos",
    {
      title: "Search repos",
      description: "Search public repositories.",
      inputSchema: z.object( { query: z.string().describe("Search query."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await searchRepos(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "repo_detail",
    {
      title: "Repo detail",
      description: "Get repository details.",
      inputSchema: z.object( { owner: z.string().describe("Owner name."), repo: z.string().describe("Repository name.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await repoDetail(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
