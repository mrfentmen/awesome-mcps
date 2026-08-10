import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { pokemonInfo } from "./api.js"
import { searchPokemon } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "pokeapi-mcp", version: "1.0.0" })
  server.tool("pokemon_info", "Get details for a Pokemon by name or ID.", { name: z.string().describe("Pokemon name or ID.") }, async (args) => {
    try { return text(await pokemonInfo(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("search_pokemon", "Search Pokemon by partial name.", { query: z.string().describe("Partial name."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await searchPokemon(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
