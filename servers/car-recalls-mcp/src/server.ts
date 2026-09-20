import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { recallByCampaign } from "./api.js"
import { recallsByVehicle } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "car-recalls-mcp", version: "1.0.0" })
  server.registerTool(
    "recalls_by_vehicle",
    {
      title: "Recalls by vehicle",
      description: "Get recalls for a make, model, and year.",
      inputSchema: z.object( { make: z.string().describe("Make like Toyota."), model: z.string().describe("Model like Camry."), year: z.number().describe("Model year.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await recallsByVehicle(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "recall_by_campaign",
    {
      title: "Recall by campaign",
      description: "Get a recall by campaign number.",
      inputSchema: z.object( { campaign: z.string().describe("Campaign number like 20V682000.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await recallByCampaign(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
