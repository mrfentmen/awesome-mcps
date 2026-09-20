import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { format, info, KevError, recent, search } from "./api.js"
const text = (s: string) => ({ content: [{ type: "text" as const, text: s }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
export function createServer() { const server = new McpServer({ name: "cisa-kev-mcp", version: "1.0.0" }); server.registerTool(
    "search_known_exploited",
    {
      title: "Search known exploited",
      description: "Search CISA's catalog of vulnerabilities known to be exploited in the wild.",
      inputSchema: z.object( { query: z.string().min(1) }),
      annotations: READ_ONLY,
    },
    async ({ query }) => { try { return text(format(await search(query))) } catch (e) { return textError(`Error: ${e instanceof Error ? e.message : String(e)}`) } }
  ); server.registerTool(
    "recent_known_exploited",
    {
      title: "Recent known exploited",
      description: "List the most recently added entries in the CISA KEV catalog.",
      inputSchema: z.object( { limit: z.number().int().min(1).max(50).default(10) }),
      annotations: READ_ONLY,
    },
    async ({ limit }) => { try { return text(format(await recent(limit))) } catch (e) { return textError(`Error: ${e instanceof Error ? e.message : String(e)}`) } }
  ); server.registerTool(
    "catalog_info",
    {
      title: "Catalog info",
      description: "Get CISA KEV catalog version and release metadata.",
      inputSchema: z.object({}),
      annotations: READ_ONLY,
    },
    async () => { try { return text(format(await info())) } catch (e) { return textError(`Error: ${e instanceof Error ? e.message : String(e)}`) } }
  ); return server }
export { KevError }
