import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { parseYaml } from "./api.js"
import { toJson } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "yaml-mcp", version: "1.0.0" })
  server.tool("parse_yaml", "Parse YAML into a readable structure.", { yaml: z.string().describe("YAML text.") }, async (args) => {
    try { return text(await parseYaml(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("to_json", "Convert YAML text to JSON.", { yaml: z.string().describe("YAML text.") }, async (args) => {
    try { return text(await toJson(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
