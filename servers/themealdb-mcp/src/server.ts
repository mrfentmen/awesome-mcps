import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { categories } from "./api.js"
import { filterByIngredient } from "./api.js"
import { random } from "./api.js"
import { search } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "themealdb-mcp", version: "1.0.0" })
  server.tool("search", "Search meals by name.", { query: z.string().describe("Meal name query.") }, async (args) => {
    try { return text(await search(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("random", "Get a random meal.", {  }, async (args) => {
    try { return text(await random(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("categories", "List meal categories.", {  }, async (args) => {
    try { return text(await categories(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("filter_by_ingredient", "Find meals by ingredient.", { ingredient: z.string().describe("Ingredient name.") }, async (args) => {
    try { return text(await filterByIngredient(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
