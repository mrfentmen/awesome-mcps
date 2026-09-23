import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import {
  errorMessage,
  listDomains,
  getDomain,
  getTopBrowsers,
} from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "ackee-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "list_domains",
    {
      title: "List domains",
      description: "All Ackee domains with ids and titles.",
      inputSchema: z.object({
      }),
      annotations: READ_ONLY,
    },
    async ({  }) => {
      try {
        return text(await listDomains());
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "get_domain",
    {
      title: "Get domain facts",
      description: "Ackee domain facts: active visitors plus yearly unique views.",
      inputSchema: z.object({
        domainId: z.string().describe("Domain id"),
      }),
      annotations: READ_ONLY,
    },
    async ({ domainId }) => {
      try {
        return text(await getDomain(domainId));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "get_top_browsers",
    {
      title: "Get top browsers",
      description: "Top browsers on an Ackee domain over the last 6 months.",
      inputSchema: z.object({
        domainId: z.string().describe("Domain id"),
      }),
      annotations: READ_ONLY,
    },
    async ({ domainId }) => {
      try {
        return text(await getTopBrowsers(domainId));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  return server
}
