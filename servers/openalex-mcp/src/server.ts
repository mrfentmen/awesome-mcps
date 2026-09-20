import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { formatAuthor, formatWork, getAuthor, getWork, OpenAlexError, searchAuthors, searchWorks } from "./api.js"
const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
export function createServer(): McpServer {
  const server = new McpServer({ name: "openalex-mcp", version: "1.0.0" })
  server.registerTool(
    "search_works",
    {
      title: "Search works",
      description: "Search scholarly works by title, topic, author, or keyword.",
      inputSchema: z.object( { query: z.string().min(1), limit: z.number().int().min(1).max(25).default(10) }),
      annotations: READ_ONLY,
    },
    async ({ query, limit }) => { try { const r = await searchWorks(query, limit); return text(`OpenAlex found ${r.meta?.count ?? 0} work(s) for "${query}":\n\n${(r.results ?? []).map((w, i) => formatWork(w, i)).join("\n\n")}`) } catch (e) { return textError(error(e)) } }
  )
  server.registerTool(
    "get_work",
    {
      title: "Get work",
      description: "Get one OpenAlex work by OpenAlex ID or URL.",
      inputSchema: z.object( { id: z.string().min(1) }),
      annotations: READ_ONLY,
    },
    async ({ id }) => { try { return text(formatWork(await getWork(id))) } catch (e) { return textError(error(e)) } }
  )
  server.registerTool(
    "search_authors",
    {
      title: "Search authors",
      description: "Search OpenAlex authors and institutions.",
      inputSchema: z.object( { query: z.string().min(1), limit: z.number().int().min(1).max(25).default(10) }),
      annotations: READ_ONLY,
    },
    async ({ query, limit }) => { try { const r = await searchAuthors(query, limit); return text(`OpenAlex authors for "${query}":\n\n${(r.results ?? []).map((a, i) => formatAuthor(a, i)).join("\n\n")}`) } catch (e) { return textError(error(e)) } }
  )
  server.registerTool(
    "get_author",
    {
      title: "Get author",
      description: "Get one OpenAlex author by ID or URL.",
      inputSchema: z.object( { id: z.string().min(1) }),
      annotations: READ_ONLY,
    },
    async ({ id }) => { try { return text(formatAuthor(await getAuthor(id))) } catch (e) { return textError(error(e)) } }
  )
  return server
}
export { OpenAlexError }
