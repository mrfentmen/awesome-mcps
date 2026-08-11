import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_formatObject, m0_getDepartments, m0_getObject, m0_MetError, m0_searchObjects, m1_object, m1_search } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'metmuseum-mcp', version: '1.0.0' })
server.tool(
    "search_objects",
    "Search the Met collection for artworks by title, artist, or keyword.",
    { query: z.string().describe("Search text, e.g. 'monet water lilies' or 'ancient egypt'"), limit: z.number().int().min(1).max(10).default(5) },
    async ({ query, limit }) => {
      try {
        const objects = await m0_searchObjects(query, limit)
        if (objects.length === 0) return text(`No Met artworks match "${query}".`)
        return text(`Met Museum results for "${query}":\n\n${objects.map((o, i) => m0_formatObject(o)).join("\n\n")}`)
      } catch (e) {
        return text(errorMessage(e))
      }
    }
  )
server.tool(
    "get_object",
    "Get one artwork from the Met by object id.",
    { id: z.number().int().describe("Object id from search_objects") },
    async ({ id }) => {
      try {
        const o = await m0_getObject(id)
        if (!o) return text(`No Met object ${id}.`)
        return text(m0_formatObject(o))
      } catch (e) {
        return text(errorMessage(e))
      }
    }
  )
server.tool(
    "get_departments",
    "List all Met Museum departments.",
    {},
    async () => {
      try {
        const deps = await m0_getDepartments()
        return text(`Met Museum departments:\n${deps.map((d) => `- ${d.departmentId}: ${d.displayName}`).join("\n")}`)
      } catch (e) {
        return text(errorMessage(e))
      }
    }
  )
server.tool("search", "Search the Met collection by text.", { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m1_search(args)) } catch (e) { return text(error(e)) }
  })
server.tool("object", "Details for one object.", { id: z.number().describe("Object ID.") }, async (args) => {
    try { return text(await m1_object(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
