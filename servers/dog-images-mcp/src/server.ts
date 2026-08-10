import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { byBreed } from "./api.js"
import { listBreeds } from "./api.js"
import { randomDog } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "dog-images-mcp", version: "1.0.0" })
  server.tool("random_dog", "A random dog picture.", {  }, async (args) => {
    try { return text(await randomDog(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("by_breed", "A random dog picture for a breed.", { breed: z.string().describe("Breed name like beagle or husky.") }, async (args) => {
    try { return text(await byBreed(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("list_breeds", "List all available breeds.", {  }, async (args) => {
    try { return text(await listBreeds(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
