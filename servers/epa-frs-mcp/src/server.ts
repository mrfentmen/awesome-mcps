import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { byState } from "./api.js"
import { facility } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "epa-frs-mcp", version: "1.0.0" })
  server.tool("by_state", "Facilities in a US state.", { state: z.string().describe("Two letter state code like VA."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await byState(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("facility", "One facility by registry ID.", { registryId: z.string().describe("FRS registry ID.") }, async (args) => {
    try { return text(await facility(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
