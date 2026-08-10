import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { clinicalTrials } from "./api.js"
import { pubmed } from "./api.js"
import { trial } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "clinical-trials-mcp", version: "1.0.0" })
  server.tool("search_clinical_trials", "Search clinical trials by condition or keyword.", { query: z.string().describe("Condition or keyword like diabetes."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await clinicalTrials(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("get_trial", "Get one clinical trial by NCT id.", { nct_id: z.string().describe("NCT id like NCT00000123.") }, async (args) => {
    try { return text(await trial(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("search_pubmed", "Search PubMed research articles.", { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await pubmed(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
