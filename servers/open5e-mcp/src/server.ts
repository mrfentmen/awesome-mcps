import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { monsters } from "./api.js"
import { spells } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "open5e-mcp", version: "1.0.0" })
  server.tool("monsters", "List monsters with optional search.", { search: z.string().describe("Search terms.").optional(), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await monsters(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("spells", "List spells with optional search.", { search: z.string().describe("Search terms.").optional(), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await spells(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
