import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import {
  errorMessage,
  listDatasets,
  getRecords,
} from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "fingrid-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "list_datasets",
    {
      title: "List datasets",
      description: "Fingrid open datasets with ids for record queries.",
      inputSchema: z.object({
      }),
      annotations: READ_ONLY,
    },
    async ({  }) => {
      try {
        return text(await listDatasets());
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "get_records",
    {
      title: "Get records",
      description: "Records from a Fingrid dataset in a time window.",
      inputSchema: z.object({
        datasetId: z.string().describe("Dataset id from list_datasets"),
        startTime: z.string().optional().describe("Start ISO datetime"),
        endTime: z.string().optional().describe("End ISO datetime"),
      }),
      annotations: READ_ONLY,
    },
    async ({ datasetId, startTime, endTime }) => {
      try {
        return text(await getRecords(datasetId, startTime, endTime));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  return server
}
