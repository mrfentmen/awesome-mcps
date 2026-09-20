import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { format, inspectTopology } from "./orbit.js"
const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const errorText = (error: unknown) => text(`Error: ${error instanceof Error ? error.message : "Local worktree inspection failed"}`)
export function createServer() { const server = new McpServer({ name: "worktree-orbit-mcp", version: "1.0.0" }); server.registerTool(
    "inspect_worktree_topology",
    {
      title: "Inspect worktree topology",
      description: "Summarize local Git worktree topology, clean or dirty state, detached worktrees, locks, and prunable entries without exposing paths, branch names, hashes, remotes, or content.",
      inputSchema: z.object( { cwd: z.string().min(1).max(1000).default(".").describe("Local Git repository path; no network access is used.") }),
      annotations: READ_ONLY,
    },
    async ({ cwd }) => { try { return text(format(await inspectTopology(cwd))) } catch (error) { return errorText(error) } }
  ); return server }
