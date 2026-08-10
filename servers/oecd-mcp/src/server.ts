import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { indicator } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "oecd-mcp", version: "1.0.0" })
  server.tool("indicator", "Get an indicator series.", { dataset: z.string().describe("Dataset id like SNA_TABLE1.").optional(), country: z.string().describe("Country code like AUS."), series: z.string().describe("Series like GDP.").optional(), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await indicator(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
