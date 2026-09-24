import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import {
  errorMessage,
  listInstalls,
  getInstall,
  listSites,
} from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "wpengine-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "list_installs",
    {
      title: "List installs",
      description: "All WP Engine installs with status, PHP version and domains.",
      inputSchema: z.object({
      }),
      annotations: READ_ONLY,
    },
    async ({  }) => {
      try {
        return text(await listInstalls());
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "get_install",
    {
      title: "Get install",
      description: "One WP Engine install with full details.",
      inputSchema: z.object({
        installId: z.string().describe("Install id"),
      }),
      annotations: READ_ONLY,
    },
    async ({ installId }) => {
      try {
        return text(await getInstall(installId));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "list_sites",
    {
      title: "List sites",
      description: "WP Engine sites with install links.",
      inputSchema: z.object({
      }),
      annotations: READ_ONLY,
    },
    async ({  }) => {
      try {
        return text(await listSites());
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  return server
}
