import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { breedInfo } from "./api.js"
import { listBreeds } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "cat-breeds-mcp", version: "1.0.0" })
  server.tool("list_breeds", "List cat breeds with temperament and origin.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await listBreeds(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("breed_info", "Get details for a specific breed.", { breed_id: z.string().describe("Breed id like abys.") }, async (args) => {
    try { return text(await breedInfo(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
