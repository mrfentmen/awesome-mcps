import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { breeds } from "./api.js"
import { random } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "dog-ceo-mcp", version: "1.0.0" })
  server.tool("breeds", "All dog breeds.", {  }, async (args) => {
    try { return text(await breeds(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("random", "A random dog photo URL.", { breed: z.string().describe("Breed like hound.").optional() }, async (args) => {
    try { return text(await random(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
