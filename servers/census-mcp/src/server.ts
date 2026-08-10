import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { countyPopulation } from "./api.js"
import { nationPopulation } from "./api.js"
import { statePopulation } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "census-mcp", version: "1.0.0" })
  server.tool("get_nation_population", "Get US population totals.", {  }, async (args) => {
    try { return text(await nationPopulation(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("get_state_population", "Get population for a state by FIPS code.", { state: z.string().describe("State FIPS code like 06 for California.") }, async (args) => {
    try { return text(await statePopulation(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("get_county_population", "Get county populations within a state.", { state: z.string().describe("State FIPS code.") }, async (args) => {
    try { return text(await countyPopulation(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
