import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { animal } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "random-animals-mcp", version: "1.0.0" })
  server.tool("animal", "A random animal photo with a fact.", { type: z.string().describe("dog, cat, fox, bird, panda, koala, duck.").optional() }, async (args) => {
    try { return text(await animal(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
