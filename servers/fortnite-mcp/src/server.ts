import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import {
  errorMessage,
  getBrNews,
  getBrShop,
  getMap,
  getAes,
  searchCosmetic,
  getPlaylists,
} from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const NON_READ_ONLY = { openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "fortnite-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "get_br_news",
    {
      title: "Get BR news",
      description: "Current Fortnite battle royale news entries with images and tab titles.",
      inputSchema: z.object({
      }),
      annotations: READ_ONLY,
    },
    async ({  }) => {
      try {
        return text(await getBrNews());
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "get_br_shop",
    {
      title: "Get item shop",
      description: "Current Fortnite item shop entries: cosmetics, prices in V-Bucks, bundles.",
      inputSchema: z.object({
      }),
      annotations: READ_ONLY,
    },
    async ({  }) => {
      try {
        return text(await getBrShop());
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "get_map",
    {
      title: "Get island map",
      description: "Current Fortnite island map images plus points of interest.",
      inputSchema: z.object({
      }),
      annotations: READ_ONLY,
    },
    async ({  }) => {
      try {
        return text(await getMap());
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "get_aes",
    {
      title: "Get AES keys",
      description: "Current Fortnite AES encryption keys for datamining pak files.",
      inputSchema: z.object({
      }),
      annotations: READ_ONLY,
    },
    async ({  }) => {
      try {
        return text(await getAes());
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "search_cosmetic",
    {
      title: "Search cosmetics",
      description: "Search Fortnite cosmetics by name: skins, emotes, pickaxes, gliders with rarity and images.",
      inputSchema: z.object({
        name: z.string().describe("Cosmetic name, e.g. 'Renegade Raider'"),
        language: z.string().default("en").describe("Response language"),
      }),
      annotations: READ_ONLY,
    },
    async ({ name, language }) => {
      try {
        return text(await searchCosmetic(name, language));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "get_playlists",
    {
      title: "Get playlists",
      description: "All Fortnite playlists/game modes with images and player counts.",
      inputSchema: z.object({
      }),
      annotations: READ_ONLY,
    },
    async ({  }) => {
      try {
        return text(await getPlaylists());
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  return server
}
