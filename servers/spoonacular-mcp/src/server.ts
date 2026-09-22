import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { formatRecipe, getRecipe, guessNutrition, searchRecipes, SpoonacularError } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "spoonacular-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "search_recipes",
    {
      title: "Search recipes",
      description: "Recipes by keyword with times and servings.",
      inputSchema: z.object({
        query: z.string().describe("Search text, e.g. 'vegan curry'"),
        limit: z.number().int().min(1).max(100).default(5),
      }),
      annotations: READ_ONLY,
    },
    async ({ query, limit }) => {
      try {
        const rows = await searchRecipes(query, limit)
        if (rows.length === 0) return text(`No recipes for "${query}".`)
        return text(rows.map((r, i) => formatRecipe(r, i)).join("\n"))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "get_recipe",
    {
      title: "Get recipe",
      description: "One recipe: ingredients and steps.",
      inputSchema: z.object({
        id: z.string().describe("Numeric recipe id (use search_recipes)"),
      }),
      annotations: READ_ONLY,
    },
    async ({ id }) => {
      try {
        return text(await getRecipe(id))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "guess_nutrition",
    {
      title: "Guess nutrition",
      description: "Estimated calories and macros for a dish name.",
      inputSchema: z.object({
        text: z.string().describe("Dish, e.g. 'chicken tikka masala'"),
      }),
      annotations: READ_ONLY,
    },
    async ({ text: dish }) => {
      try {
        return text(await guessNutrition(dish))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof SpoonacularError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
