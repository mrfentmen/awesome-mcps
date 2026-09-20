import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { format, hotspots, hygiene, recentChanges, summary } from "./forensics.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const errorText = (error: unknown) => text(`Error: ${error instanceof Error ? error.message : String(error)}`)
const cwd = z.string().min(1).max(1000).default(".").describe("Local repository path. No network access is used.")

export function createServer() {
  const server = new McpServer({ name: "repo-forensics-mcp", version: "1.0.0" })
  server.registerTool(
    "repository_summary",
    {
      title: "Repository summary",
      description: "Read branch, working-tree, remote names, and latest commit metadata from a local Git repository.",
      inputSchema: z.object( { cwd }),
      annotations: READ_ONLY,
    },
    async ({ cwd: directory }) => { try { return text(format(await summary(directory))) } catch (error) { return errorText(error) } }
  )
  server.registerTool(
    "recent_changes",
    {
      title: "Recent changes",
      description: "List recent local Git commits with bounded output.",
      inputSchema: z.object( { cwd, limit: z.number().int().min(1).max(50).default(10) }),
      annotations: READ_ONLY,
    },
    async ({ cwd: directory, limit }) => { try { return text(format(await recentChanges(directory, limit))) } catch (error) { return errorText(error) } }
  )
  server.registerTool(
    "file_hotspots",
    {
      title: "File hotspots",
      description: "Find files that appear most often in recent repository history. This is a heuristic for review focus, not a defect detector.",
      inputSchema: z.object( { cwd, limit: z.number().int().min(1).max(50).default(20) }),
      annotations: READ_ONLY,
    },
    async ({ cwd: directory, limit }) => { try { return text(format(await hotspots(directory, limit))) } catch (error) { return errorText(error) } }
  )
  server.registerTool(
    "top_level_hygiene",
    {
      title: "Top level hygiene",
      description: "Check top-level large files, .gitignore presence, and working-tree dirtiness without reading file contents.",
      inputSchema: z.object( { cwd }),
      annotations: READ_ONLY,
    },
    async ({ cwd: directory }) => { try { return text(format(await hygiene(directory))) } catch (error) { return errorText(error) } }
  )
  return server
}
