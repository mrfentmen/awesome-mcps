import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { format, recoverySignals, reflogSignals, stashSignals } from "./archaeology.js"
const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const errorText = (error: unknown) => text(`Error: ${error instanceof Error ? error.message : "Local Git archaeology failed"}`)
export function createServer() { const server = new McpServer({ name: "git-reflog-archaeologist-mcp", version: "1.0.0" }); const cwd = z.string().min(1).max(1000).default(".").describe("Local Git repository path; no network access is used."); server.registerTool(
    "reflog_signals",
    {
      title: "Reflog signals",
      description: "Summarize local reflog activity by count and age bucket without returning ref names, hashes, subjects, paths, or remotes.",
      inputSchema: z.object( { cwd }),
      annotations: READ_ONLY,
    },
    async ({ cwd: directory }) => { try { return text(format(await reflogSignals(directory))) } catch (error) { return errorText(error) } }
  ); server.registerTool(
    "recovery_signals",
    {
      title: "Recovery signals",
      description: "Count unreachable Git object types and recovery hints without returning object IDs, messages, paths, or contents.",
      inputSchema: z.object( { cwd }),
      annotations: READ_ONLY,
    },
    async ({ cwd: directory }) => { try { return text(format(await recoverySignals(directory))) } catch (error) { return errorText(error) } }
  ); server.registerTool(
    "stash_signals",
    {
      title: "Stash signals",
      description: "Summarize local stash age buckets and count without returning stash messages, refs, hashes, or paths.",
      inputSchema: z.object( { cwd }),
      annotations: READ_ONLY,
    },
    async ({ cwd: directory }) => { try { return text(format(await stashSignals(directory))) } catch (error) { return errorText(error) } }
  ); return server }
