import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { series } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "bls-mcp", version: "1.0.0" })
  server.tool("series", "Get a BLS series.", { id: z.string().describe("Series id like CES0000000001."), year: z.string().describe("Start year like 2023.").optional() }, async (args) => {
    try { return text(await series(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
