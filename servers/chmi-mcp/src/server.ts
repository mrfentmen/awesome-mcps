import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import {
  errorMessage,
  browse,
  getFile,
  getLatestAlert,
} from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "chmi-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "browse",
    {
      title: "Browse open data",
      description: "List CHMI open-data directories and files, e.g. '/', 'meteorology/weather/alerts/'.",
      inputSchema: z.object({
        path: z.string().default("/").describe("Directory path"),
      }),
      annotations: READ_ONLY,
    },
    async ({ path }) => {
      try {
        return text(await browse(path));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "get_file",
    {
      title: "Download file",
      description: "Download a CHMI open-data text file (CSV, XML, JSON, TXT), truncated.",
      inputSchema: z.object({
        path: z.string().describe("File path from browse"),
      }),
      annotations: READ_ONLY,
    },
    async ({ path }) => {
      try {
        return text(await getFile(path));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "get_latest_alert",
    {
      title: "Get latest warning",
      description: "Newest CHMI weather warning file content.",
      inputSchema: z.object({
      }),
      annotations: READ_ONLY,
    },
    async ({  }) => {
      try {
        return text(await getLatestAlert());
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  return server
}
