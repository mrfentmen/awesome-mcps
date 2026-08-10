import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { generateMany } from "./api.js"
import { generateUuid } from "./api.js"
import { validateUuid } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "uuid-mcp", version: "1.0.0" })
  server.tool("generate_uuid", "Generate a random UUID.", {  }, async (args) => {
    try { return text(await generateUuid(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("generate_many", "Generate several UUIDs.", { count: z.number().describe("How many.").optional() }, async (args) => {
    try { return text(await generateMany(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("validate_uuid", "Check if a string is a valid UUID.", { uuid: z.string().describe("String to check.") }, async (args) => {
    try { return text(await validateUuid(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
