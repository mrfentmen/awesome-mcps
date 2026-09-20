import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { format, inspect, plan } from "./sieve.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const errorText = (error: unknown) => text(`Error: ${error instanceof Error ? error.message : String(error)}`)
const file = z.string().min(1).max(1000).describe("Local JSON Schema file. Network URLs are not accepted.")

export function createServer() {
  const server = new McpServer({ name: "schema-sieve-mcp", version: "1.0.0" })
  server.registerTool(
    "inspect_schema",
    {
      title: "Inspect schema",
      description: "Summarize a local JSON Schema's types, properties, required fields, composition, and constraints without returning examples or defaults.",
      inputSchema: z.object( { file }),
      annotations: READ_ONLY,
    },
    async ({ file: target }) => { try { return text(format(await inspect(target))) } catch (error) { return errorText(error) } }
  )
  server.registerTool(
    "plan_fixture",
    {
      title: "Plan fixture",
      description: "Create a privacy-safe placeholder plan for test fixture fields in a local JSON Schema. It does not fabricate or copy example data.",
      inputSchema: z.object( { file }),
      annotations: READ_ONLY,
    },
    async ({ file: target }) => { try { return text(format(await plan(target))) } catch (error) { return errorText(error) } }
  )
  return server
}
