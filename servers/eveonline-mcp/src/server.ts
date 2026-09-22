import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import {
  errorMessage,
  getStatus,
  search,
  getCharacter,
  getCorporation,
  getAlliance,
  getMarketPrices,
} from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const NON_READ_ONLY = { openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "eveonline-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "get_status",
    {
      title: "Get Tranquility status",
      description: "EVE Online server status: online players, server version, start time.",
      inputSchema: z.object({
        datasource: z.string().default("tranquility").describe("Datasource, usually tranquility"),
      }),
      annotations: READ_ONLY,
    },
    async ({ datasource }) => {
      try {
        return text(await getStatus(datasource));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "search",
    {
      title: "Search New Eden",
      description: "Universal EVE search across characters, corporations, alliances, items, systems and more.",
      inputSchema: z.object({
        query: z.string().describe("Search text"),
        categories: z.string().describe("Comma list, e.g. 'character,corporation,alliance,solar_system,inventory_type'"),
        strict: z.boolean().default(false).describe("Strict matching"),
        datasource: z.string().default("tranquility").describe("Datasource"),
      }),
      annotations: READ_ONLY,
    },
    async ({ query, categories, strict, datasource }) => {
      try {
        return text(await search(query, categories, strict, datasource));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "get_character",
    {
      title: "Get character info",
      description: "Public EVE character info: name, corporation, alliance, birthday, security status.",
      inputSchema: z.object({
        characterId: z.number().describe("Character id"),
        datasource: z.string().default("tranquility").describe("Datasource"),
      }),
      annotations: READ_ONLY,
    },
    async ({ characterId, datasource }) => {
      try {
        return text(await getCharacter(characterId, datasource));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "get_corporation",
    {
      title: "Get corporation info",
      description: "Public EVE corporation info: name, ticker, alliance, member count, description.",
      inputSchema: z.object({
        corporationId: z.number().describe("Corporation id"),
        datasource: z.string().default("tranquility").describe("Datasource"),
      }),
      annotations: READ_ONLY,
    },
    async ({ corporationId, datasource }) => {
      try {
        return text(await getCorporation(corporationId, datasource));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "get_alliance",
    {
      title: "Get alliance info",
      description: "Public EVE alliance info: name, ticker, corporations, executor corp.",
      inputSchema: z.object({
        allianceId: z.number().describe("Alliance id"),
        datasource: z.string().default("tranquility").describe("Datasource"),
      }),
      annotations: READ_ONLY,
    },
    async ({ allianceId, datasource }) => {
      try {
        return text(await getAlliance(allianceId, datasource));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "get_market_prices",
    {
      title: "Get market prices",
      description: "Universe-wide average and adjusted market prices for all EVE item types.",
      inputSchema: z.object({
        datasource: z.string().default("tranquility").describe("Datasource"),
      }),
      annotations: READ_ONLY,
    },
    async ({ datasource }) => {
      try {
        return text(await getMarketPrices(datasource));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  return server
}
