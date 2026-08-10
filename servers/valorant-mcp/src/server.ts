import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { agent } from "./api.js"
import { agents } from "./api.js"
import { maps } from "./api.js"
import { weapons } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "valorant-mcp", version: "1.0.0" })
  server.tool("agents", "List all agents.", { language: z.string().describe("Language code like en-US.").optional() }, async (args) => {
    try { return text(await agents(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("agent", "Details for one agent.", { uuid: z.string().describe("Agent UUID."), language: z.string().describe("Language code.").optional() }, async (args) => {
    try { return text(await agent(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("maps", "List all maps.", {  }, async (args) => {
    try { return text(await maps(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("weapons", "List all weapons.", {  }, async (args) => {
    try { return text(await weapons(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
