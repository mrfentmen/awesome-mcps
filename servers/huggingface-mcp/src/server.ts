import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { model } from "./api.js"
import { models } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "huggingface-mcp", version: "1.0.0" })
  server.registerTool(
    "models",
    {
      title: "Models",
      description: "Public Hugging Face models.",
      inputSchema: z.object( { limit: z.number().describe("Max results.").optional(), query: z.string().describe("Search terms.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await models(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "model",
    {
      title: "Model",
      description: "Details for one model.",
      inputSchema: z.object( { name: z.string().describe("Model id.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await model(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
