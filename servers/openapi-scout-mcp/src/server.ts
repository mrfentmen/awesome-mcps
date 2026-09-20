import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { format, operation, schemas, summary } from "./scout.js"
const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const errorText = (error: unknown) => text(`Error: ${error instanceof Error ? error.message : String(error)}`)
const file = z.string().min(1).max(1000).describe("Local JSON OpenAPI or Swagger file. No network URLs are accepted.")
export function createServer() {
  const server = new McpServer({ name: "openapi-scout-mcp", version: "1.0.0" })
  server.registerTool(
    "inspect_spec",
    {
      title: "Inspect spec",
      description: "Summarize a local OpenAPI or Swagger JSON file, including operations and servers, while redacting examples, defaults, and credential-like data.",
      inputSchema: z.object( { file }),
      annotations: READ_ONLY,
    },
    async ({ file: target }) => { try { return text(format(await summary(target))) } catch (error) { return errorText(error) } }
  )
  server.registerTool(
    "find_operation",
    {
      title: "Find operation",
      description: "Find one operation by operationId in a local OpenAPI or Swagger JSON file.",
      inputSchema: z.object( { file, operationId: z.string().min(1).max(200) }),
      annotations: READ_ONLY,
    },
    async ({ file: target, operationId }) => { try { const result = await operation(target, operationId); return text(result ? format(result) : `No operationId found: ${operationId}`) } catch (error) { return errorText(error) } }
  )
  server.registerTool(
    "list_schemas",
    {
      title: "List schemas",
      description: "List local OpenAPI component schemas or Swagger definitions with sensitive example values redacted.",
      inputSchema: z.object( { file }),
      annotations: READ_ONLY,
    },
    async ({ file: target }) => { try { return text(format(await schemas(target))) } catch (error) { return errorText(error) } }
  )
  return server
}
