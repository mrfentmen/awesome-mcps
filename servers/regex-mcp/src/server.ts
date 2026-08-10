import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { matches } from "./api.js"
import { testRegex } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "regex-mcp", version: "1.0.0" })
  server.tool("test", "Test a regular expression against a string.", { pattern: z.string().describe("Regular expression."), input: z.string().describe("String to test.") }, async (args) => {
    try { return text(await testRegex(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("matches", "Return all matches of a pattern in a string.", { pattern: z.string().describe("Regular expression."), input: z.string().describe("String to search."), limit: z.number().describe("Max matches.").optional() }, async (args) => {
    try { return text(await matches(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
