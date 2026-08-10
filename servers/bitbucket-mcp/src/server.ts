import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { repo } from "./api.js"
import { repos } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "bitbucket-mcp", version: "1.0.0" })
  server.tool("repos", "List repos for a workspace.", { workspace: z.string().describe("Workspace slug."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await repos(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("repo", "Get a repo.", { workspace: z.string().describe("Workspace slug."), repo: z.string().describe("Repo name.") }, async (args) => {
    try { return text(await repo(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
