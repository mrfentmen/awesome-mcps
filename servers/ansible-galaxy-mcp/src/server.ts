import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { collection } from "./api.js"
import { collections } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "ansible-galaxy-mcp", version: "1.0.0" })
  server.registerTool(
    "collections",
    {
      title: "Collections",
      description: "Search Ansible collections.",
      inputSchema: z.object( { search: z.string().describe("Optional search terms.").optional(), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await collections(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "collection",
    {
      title: "Collection",
      description: "Details for one collection.",
      inputSchema: z.object( { namespace: z.string().describe("Namespace."), name: z.string().describe("Collection name.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await collection(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
