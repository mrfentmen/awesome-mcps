import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { model } from "./api.js"
import { models } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "huggingface-mcp", version: "1.0.0" })
  server.tool("models", "Public Hugging Face models.", { limit: z.number().describe("Max results.").optional(), query: z.string().describe("Search terms.").optional() }, async (args) => {
    try { return text(await models(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("model", "Details for one model.", { name: z.string().describe("Model id.") }, async (args) => {
    try { return text(await model(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
