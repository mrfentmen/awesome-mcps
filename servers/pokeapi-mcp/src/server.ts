import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { pokemonInfo } from "./api.js"
import { searchPokemon } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "pokeapi-mcp", version: "1.0.0" })
  server.registerTool(
    "pokemon_info",
    {
      title: "Pokemon info",
      description: "Get details for a Pokemon by name or ID.",
      inputSchema: z.object( { name: z.string().describe("Pokemon name or ID.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await pokemonInfo(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "search_pokemon",
    {
      title: "Search pokemon",
      description: "Search Pokemon by partial name.",
      inputSchema: z.object( { query: z.string().describe("Partial name."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await searchPokemon(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
