import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { nodesInBox } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "overpass-mcp", version: "1.0.0" })
  server.tool("nodes_in_box", "Find map features of a type inside a bounding box.", { min_lat: z.number().describe("Minimum latitude."), min_lon: z.number().describe("Minimum longitude."), max_lat: z.number().describe("Maximum latitude."), max_lon: z.number().describe("Maximum longitude."), amenity: z.string().describe("Feature type like cafe or school.").optional(), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await nodesInBox(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
