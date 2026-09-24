import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import {
  errorMessage,
  getAssetMetrics,
  listMetrics,
} from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "coinmetrics-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "get_asset_metrics",
    {
      title: "Get asset metrics",
      description: "Coin Metrics time series, e.g. assets 'btc,eth', metrics 'PriceUSD', frequency '1d'.",
      inputSchema: z.object({
        assets: z.string().describe("Comma-separated assets"),
        metrics: z.string().describe("Comma-separated metrics"),
        startTime: z.string().describe("Start ISO date"),
        endTime: z.string().describe("End ISO date"),
        frequency: z.string().default("1d").describe("Frequency like 1d or 1h"),
      }),
      annotations: READ_ONLY,
    },
    async ({ assets, metrics, startTime, endTime, frequency }) => {
      try {
        return text(await getAssetMetrics(assets, metrics, startTime, endTime, frequency));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "list_metrics",
    {
      title: "List asset metrics",
      description: "Coin Metrics metric catalog for assets with availability windows.",
      inputSchema: z.object({
        assets: z.string().describe("Comma-separated assets"),
      }),
      annotations: READ_ONLY,
    },
    async ({ assets }) => {
      try {
        return text(await listMetrics(assets));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  return server
}
