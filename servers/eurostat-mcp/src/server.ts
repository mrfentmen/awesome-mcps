import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { dataset } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "eurostat-mcp", version: "1.0.0" })
  server.tool("dataset", "Summary and values for a Eurostat dataset.", { code: z.string().describe("Dataset code like teilm020."), geo: z.string().describe("Optional country code like DE.").optional(), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await dataset(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
