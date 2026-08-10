import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { categories } from "./api.js"
import { random } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "chuck-norris-mcp", version: "1.0.0" })
  server.tool("random", "A random Chuck Norris joke.", {  }, async (args) => {
    try { return text(await random(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("categories", "Joke categories.", {  }, async (args) => {
    try { return text(await categories(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
