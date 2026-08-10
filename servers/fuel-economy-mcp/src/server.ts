import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { vehicleMpg } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "fuel-economy-mcp", version: "1.0.0" })
  server.tool("vehicle_mpg", "Get fuel economy for a make, model, and year.", { make: z.string().describe("Make like Honda."), model: z.string().describe("Model like Civic."), year: z.number().describe("Model year.") }, async (args) => {
    try { return text(await vehicleMpg(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
