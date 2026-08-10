import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { generate } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "baconipsum-mcp", version: "1.0.0" })
  server.tool("generate", "Generate placeholder text.", { type: z.string().describe("meat-and-filler or all-meat.").optional(), sentences: z.number().describe("Number of sentences.").optional() }, async (args) => {
    try { return text(await generate(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
