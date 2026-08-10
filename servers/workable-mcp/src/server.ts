import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { boards } from "./api.js"
import { jobs } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "workable-mcp", version: "1.0.0" })
  server.tool("boards", "List boards.", {  }, async (args) => {
    try { return text(await boards(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("jobs", "List jobs for a board.", { board: z.string().describe("Board account name.") }, async (args) => {
    try { return text(await jobs(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
