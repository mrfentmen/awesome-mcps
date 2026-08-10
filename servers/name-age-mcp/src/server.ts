import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { estimateAge } from "./api.js"
import { estimateGender } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "name-age-mcp", version: "1.0.0" })
  server.tool("estimate_age", "Estimate the typical age for a first name.", { name: z.string().describe("First name.") }, async (args) => {
    try { return text(await estimateAge(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("estimate_gender", "Estimate the gender for a first name.", { name: z.string().describe("First name.") }, async (args) => {
    try { return text(await estimateGender(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
