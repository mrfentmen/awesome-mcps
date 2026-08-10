import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { jobCategories } from "./api.js"
import { searchJobs } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "job-search-mcp", version: "1.0.0" })
  server.tool("search_jobs", "Search remote jobs by keyword and category.", { query: z.string().describe("Keyword like developer.").optional(), category: z.string().describe("Category like Software Development.").optional(), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await searchJobs(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("job_categories", "List job categories.", {  }, async (args) => {
    try { return text(await jobCategories(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
