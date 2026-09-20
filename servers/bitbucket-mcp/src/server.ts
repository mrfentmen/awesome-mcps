import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { repo } from "./api.js"
import { repos } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "bitbucket-mcp", version: "1.0.0" })
  server.registerTool(
    "repos",
    {
      title: "Repos",
      description: "List repos for a workspace.",
      inputSchema: z.object( { workspace: z.string().describe("Workspace slug."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await repos(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "repo",
    {
      title: "Repo",
      description: "Get a repo.",
      inputSchema: z.object( { workspace: z.string().describe("Workspace slug."), repo: z.string().describe("Repo name.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await repo(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
