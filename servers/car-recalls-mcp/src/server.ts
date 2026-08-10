import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { recallByCampaign } from "./api.js"
import { recallsByVehicle } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "car-recalls-mcp", version: "1.0.0" })
  server.tool("recalls_by_vehicle", "Get recalls for a make, model, and year.", { make: z.string().describe("Make like Toyota."), model: z.string().describe("Model like Camry."), year: z.number().describe("Model year.") }, async (args) => {
    try { return text(await recallsByVehicle(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("recall_by_campaign", "Get a recall by campaign number.", { campaign: z.string().describe("Campaign number like 20V682000.") }, async (args) => {
    try { return text(await recallByCampaign(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
