import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { all } from "./api.js"
import { fruit } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "fruityvice-mcp", version: "1.0.0" })
  server.tool("fruit", "Get a fruit by name.", { name: z.string().describe("Fruit name.") }, async (args) => {
    try { return text(await fruit(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("all", "List all fruits.", {  }, async (args) => {
    try { return text(await all(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
