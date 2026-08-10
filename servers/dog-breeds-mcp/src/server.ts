import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { listBreeds } from "./api.js"
import { randomImage } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "dog-breeds-mcp", version: "1.0.0" })
  server.tool("list_breeds", "List all dog breeds.", {  }, async (args) => {
    try { return text(await listBreeds(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("random_image", "Get a random dog image for a breed.", { breed: z.string().describe("Breed name like hound.").optional() }, async (args) => {
    try { return text(await randomImage(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
