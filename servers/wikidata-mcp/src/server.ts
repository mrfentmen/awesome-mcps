import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_entity, m0_format, m0_search, m0_sparql, m0_WikidataError, m1_search } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'wikidata-mcp', version: '1.0.0' })
server.tool("search_entities", "Search Wikidata entities by name or description.", { query: z.string().min(1) }, async ({ query }) => { try { return text(m0_format(await m0_search(query))) } catch (e) { return text(`Error: ${e instanceof Error ? e.message : String(e)}`) } })
server.tool("get_entity", "Get public Wikidata labels, descriptions, claims, and sitelinks by Q ID.", { id: z.string().regex(/^Q\d+$/i) }, async ({ id }) => { try { return text(m0_format(await m0_entity(id.toUpperCase()))) } catch (e) { return text(`Error: ${e instanceof Error ? e.message : String(e)}`) } })
server.tool("query_knowledge", "Run a bounded read-only SPARQL query against Wikidata. Keep queries selective and include LIMIT.", { query: z.string().min(1).max(8000) }, async ({ query }) => { try { return text(m0_format(await m0_sparql(query))) } catch (e) { return text(`Error: ${e instanceof Error ? e.message : String(e)}`) } })
server.tool("search", "Search Wikidata entities.", { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m1_search(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
