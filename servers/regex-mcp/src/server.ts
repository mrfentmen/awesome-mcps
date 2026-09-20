import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { matches } from "./api.js"
import { testRegex } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "regex-mcp", version: "1.0.0" })
  server.registerTool(
    "test",
    {
      title: "Test",
      description: "Test a regular expression against a string.",
      inputSchema: z.object( { pattern: z.string().describe("Regular expression."), input: z.string().describe("String to test.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await testRegex(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "matches",
    {
      title: "Matches",
      description: "Return all matches of a pattern in a string.",
      inputSchema: z.object( { pattern: z.string().describe("Regular expression."), input: z.string().describe("String to search."), limit: z.number().describe("Max matches.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await matches(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
