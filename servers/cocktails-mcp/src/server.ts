import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { byIngredient } from "./api.js"
import { cocktailDetails } from "./api.js"
import { searchCocktails } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "cocktails-mcp", version: "1.0.0" })
  server.registerTool(
    "search_cocktails",
    {
      title: "Search cocktails",
      description: "Search cocktails by name.",
      inputSchema: z.object( { query: z.string().describe("Cocktail name.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await searchCocktails(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "by_ingredient",
    {
      title: "By ingredient",
      description: "Find cocktails by ingredient.",
      inputSchema: z.object( { ingredient: z.string().describe("Ingredient name.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await byIngredient(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "cocktail_details",
    {
      title: "Cocktail details",
      description: "Get a full cocktail recipe by ID.",
      inputSchema: z.object( { cocktailId: z.string().describe("Cocktail ID.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await cocktailDetails(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
