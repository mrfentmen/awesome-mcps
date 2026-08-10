import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { byIngredient } from "./api.js"
import { recipeDetails } from "./api.js"
import { searchRecipes } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "recipes-mcp", version: "1.0.0" })
  server.tool("search_recipes", "Search recipes by name.", { query: z.string().describe("Recipe name.") }, async (args) => {
    try { return text(await searchRecipes(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("by_ingredient", "Find recipes using a main ingredient.", { ingredient: z.string().describe("Ingredient name.") }, async (args) => {
    try { return text(await byIngredient(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("recipe_details", "Get the full recipe by ID.", { mealId: z.string().describe("Meal ID.") }, async (args) => {
    try { return text(await recipeDetails(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
