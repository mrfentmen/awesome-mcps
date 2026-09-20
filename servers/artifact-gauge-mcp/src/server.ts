import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { format, inspect, manifest } from "./gauge.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const errorText = (error: unknown) => text(`Error: ${error instanceof Error ? error.message : String(error)}`)

export function createServer() {
  const server = new McpServer({ name: "artifact-gauge-mcp", version: "1.0.0" })
  server.registerTool(
    "inspect_artifacts",
    {
      title: "Inspect artifacts",
      description: "Inspect local artifact sizes, extension totals, largest files, and dependency manifest names without returning file contents.",
      inputSchema: z.object( { project: z.string().min(1).max(1000).describe("Local project directory; no URLs") }),
      annotations: READ_ONLY,
    },
    async ({ project }) => { try { return text(format(await inspect(project))) } catch (error) { return errorText(error) } }
  )
  server.registerTool(
    "inspect_manifest",
    {
      title: "Inspect manifest",
      description: "Inspect bounded metadata for one recognized local dependency manifest without returning its contents or versions.",
      inputSchema: z.object( { project: z.string().min(1).max(1000), file: z.string().min(1).max(500) }),
      annotations: READ_ONLY,
    },
    async ({ project, file }) => { try { return text(format(await manifest(project, file))) } catch (error) { return errorText(error) } }
  )
  return server
}
