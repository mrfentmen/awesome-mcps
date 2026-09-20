import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { vehicleMpg } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "fuel-economy-mcp", version: "1.0.0" })
  server.registerTool(
    "vehicle_mpg",
    {
      title: "Vehicle mpg",
      description: "Get fuel economy for a make, model, and year.",
      inputSchema: z.object( { make: z.string().describe("Make like Honda."), model: z.string().describe("Model like Civic."), year: z.number().describe("Model year.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await vehicleMpg(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
