import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_categories, m0_filterByIngredient, m0_random, m0_search, m1_byIngredient, m1_recipeDetails, m1_searchRecipes } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'themealdb-mcp', version: '1.0.0' })
server.tool("search", "Search meals by name.", { query: z.string().describe("Meal name query.") }, async (args) => {
    try { return text(await m0_search(args)) } catch (e) { return text(error(e)) }
  })
server.tool("random", "Get a random meal.", {  }, async (args) => {
    try { return text(await m0_random(args)) } catch (e) { return text(error(e)) }
  })
server.tool("categories", "List meal categories.", {  }, async (args) => {
    try { return text(await m0_categories(args)) } catch (e) { return text(error(e)) }
  })
server.tool("filter_by_ingredient", "Find meals by ingredient.", { ingredient: z.string().describe("Ingredient name.") }, async (args) => {
    try { return text(await m0_filterByIngredient(args)) } catch (e) { return text(error(e)) }
  })
server.tool("search_recipes", "Search recipes by name.", { query: z.string().describe("Recipe name.") }, async (args) => {
    try { return text(await m1_searchRecipes(args)) } catch (e) { return text(error(e)) }
  })
server.tool("by_ingredient", "Find recipes using a main ingredient.", { ingredient: z.string().describe("Ingredient name.") }, async (args) => {
    try { return text(await m1_byIngredient(args)) } catch (e) { return text(error(e)) }
  })
server.tool("recipe_details", "Get the full recipe by ID.", { mealId: z.string().describe("Meal ID.") }, async (args) => {
    try { return text(await m1_recipeDetails(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
