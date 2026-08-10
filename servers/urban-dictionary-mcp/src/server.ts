import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { define } from "./api.js"
import { random } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "urban-dictionary-mcp", version: "1.0.0" })
  server.tool("define", "Get definitions for a term.", { term: z.string().describe("The term to look up."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await define(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("random", "Get a random Urban Dictionary entry.", {  }, async (args) => {
    try { return text(await random(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
