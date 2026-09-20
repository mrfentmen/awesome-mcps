import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { parseYaml } from "./api.js"
import { toJson } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "yaml-mcp", version: "1.0.0" })
  server.registerTool(
    "parse_yaml",
    {
      title: "Parse yaml",
      description: "Parse YAML into a readable structure.",
      inputSchema: z.object( { yaml: z.string().describe("YAML text.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await parseYaml(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "to_json",
    {
      title: "To json",
      description: "Convert YAML text to JSON.",
      inputSchema: z.object( { yaml: z.string().describe("YAML text.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await toJson(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
