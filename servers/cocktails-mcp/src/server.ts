import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { byIngredient } from "./api.js"
import { cocktailDetails } from "./api.js"
import { searchCocktails } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "cocktails-mcp", version: "1.0.0" })
  server.tool("search_cocktails", "Search cocktails by name.", { query: z.string().describe("Cocktail name.") }, async (args) => {
    try { return text(await searchCocktails(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("by_ingredient", "Find cocktails by ingredient.", { ingredient: z.string().describe("Ingredient name.") }, async (args) => {
    try { return text(await byIngredient(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("cocktail_details", "Get a full cocktail recipe by ID.", { cocktailId: z.string().describe("Cocktail ID.") }, async (args) => {
    try { return text(await cocktailDetails(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
