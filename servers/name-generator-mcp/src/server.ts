import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { codename } from "./api.js"
import { randomName } from "./api.js"
import { username } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "name-generator-mcp", version: "1.0.0" })
  server.tool("random_name", "Generate a random full name.", { count: z.number().describe("How many.").optional() }, async (args) => {
    try { return text(await randomName(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("username", "Generate a random username.", { count: z.number().describe("How many.").optional() }, async (args) => {
    try { return text(await username(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("codename", "Generate a random project codename.", { count: z.number().describe("How many.").optional() }, async (args) => {
    try { return text(await codename(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
