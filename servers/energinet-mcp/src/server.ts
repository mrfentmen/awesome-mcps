import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import {
  errorMessage,
  getPowerNow,
  getDataset,
} from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "energinet-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "get_power_now",
    {
      title: "Get live power system",
      description: "Live Danish power system: production, consumption, exchange right now.",
      inputSchema: z.object({
        limit: z.number().default(5).describe("How many rows"),
      }),
      annotations: READ_ONLY,
    },
    async ({ limit }) => {
      try {
        return text(await getPowerNow(limit));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "get_dataset",
    {
      title: "Query any dataset",
      description: "Rows from any Energinet open dataset by name.",
      inputSchema: z.object({
        dataset: z.string().describe("Dataset name"),
        limit: z.number().default(5).describe("How many rows"),
      }),
      annotations: READ_ONLY,
    },
    async ({ dataset, limit }) => {
      try {
        return text(await getDataset(dataset, limit));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  return server
}
