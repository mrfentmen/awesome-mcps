import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { compareSnapshots, format } from "./diff.js"
const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const errorText = (error: unknown) => text(`Error: ${error instanceof Error ? error.message : String(error)}`)
export function createServer() { const server = new McpServer({ name: "contract-diff-mcp", version: "1.0.0" }); server.registerTool(
    "compare_contract_snapshots",
    {
      title: "Compare contract snapshots",
      description: "Compare two local JSON contract snapshots using a coarse structural fingerprint; schema names, paths, values, and versions are never returned.",
      inputSchema: z.object( { before: z.string().min(1).max(1000), after: z.string().min(1).max(1000) }),
      annotations: READ_ONLY,
    },
    async ({ before, after }) => { try { return text(format(await compareSnapshots(before, after))) } catch (error) { return errorText(error) } }
  ); return server }
