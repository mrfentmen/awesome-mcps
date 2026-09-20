import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { analyze, format } from "./contract.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const errorText = (error: unknown) => text(`Error: ${error instanceof Error ? error.message : String(error)}`)

export function createServer() {
  const server = new McpServer({ name: "env-contract-mcp", version: "1.0.0" })
  server.registerTool(
    "inspect_contract",
    {
      title: "Inspect contract",
      description: "Inspect a local project for declared and referenced environment variable names without reading values.",
      inputSchema: z.object( { project: z.string().min(1).max(1000).describe("Local project directory; no network URLs") }),
      annotations: READ_ONLY,
    },
    async ({ project }) => { try { return text(format(await analyze(project))) } catch (error) { return errorText(error) } }
  )
  return server
}
