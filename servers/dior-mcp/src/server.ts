import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import {
  errorMessage,
  searchListings,
  listNewest,
  getListing,
  priceOverview,
} from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "dior-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "search_listings",
    {
      title: "Search listings",
      description: "Search resale listings by keyword across Fashionphile and Rebag.",
      inputSchema: z.object({
        query: z.string().describe("Keyword, e.g. speedy, birkin, submariner."),
        limit: z.string().describe("Max results (default 10, max 25).").optional()
      }),
      annotations: READ_ONLY,
    },
    async ({ query, limit }) => {
      try {
        return text(await searchListings(query, limit));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "list_newest",
    {
      title: "Newest listings",
      description: "Newest catalog listings from both resale sources.",
      inputSchema: z.object({
        limit: z.string().describe("Max results (default 20, max 50).").optional(),
        page: z.string().describe("Catalog page (default 1).").optional()
      }),
      annotations: READ_ONLY,
    },
    async ({ limit, page }) => {
      try {
        return text(await listNewest(limit, page));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "get_listing",
    {
      title: "Get listing",
      description: "Full listing details by handle.",
      inputSchema: z.object({
        handle: z.string().describe("Product handle/slug."),
        source: z.string().describe("fashionphile or rebag (tries both).").optional()
      }),
      annotations: READ_ONLY,
    },
    async ({ handle, source }) => {
      try {
        return text(await getListing(handle, source));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "price_overview",
    {
      title: "Price overview",
      description: "Ask-price distribution (min/p25/median/p75/max). Asks, not appraisals.",
      inputSchema: z.object({
        limit: z.string().describe("Sample size (default 200, max 500).").optional()
      }),
      annotations: READ_ONLY,
    },
    async ({ limit }) => {
      try {
        return text(await priceOverview(limit));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  return server
}