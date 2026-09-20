import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import {
  RadioError,
  formatStation,
  searchStations,
  stationsByCountry,
  stationsByTag,
  topVoted,
} from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "radio-browser-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "search_stations",
    {
      title: "Search stations",
      description: "Search 40,000+ internet radio stations by name.",
      inputSchema: z.object(
    { name: z.string().describe("Station name, e.g. 'hardcore' or 'SomaFM'"), limit: z.number().int().min(1).max(20).default(8) }),
      annotations: READ_ONLY,
    },
    async ({ name, limit }) => {
      try {
        const stations = await searchStations(name, limit)
        if (stations.length === 0) return text(`No stations match "${name}".`)
        return text(`Stations matching "${name}":\n\n${stations.map((s, i) => formatStation(s, i)).join("\n\n")}`)
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "stations_by_tag",
    {
      title: "Stations by tag",
      description: "Find stations by genre tag (e.g. 'hardcore', 'jazz', 'lofi', 'pirate').",
      inputSchema: z.object(
    { tag: z.string().describe("Genre tag"), limit: z.number().int().min(1).max(20).default(8) }),
      annotations: READ_ONLY,
    },
    async ({ tag, limit }) => {
      try {
        const stations = await stationsByTag(tag, limit)
        if (stations.length === 0) return text(`No stations tagged "${tag}".`)
        return text(`Top "${tag}" stations:\n\n${stations.map((s, i) => formatStation(s, i)).join("\n\n")}`)
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "stations_by_country",
    {
      title: "Stations by country",
      description: "Find stations from a country (e.g. 'Japan', 'Germany', 'Netherlands').",
      inputSchema: z.object(
    { country: z.string().describe("Country name"), limit: z.number().int().min(1).max(20).default(8) }),
      annotations: READ_ONLY,
    },
    async ({ country, limit }) => {
      try {
        const stations = await stationsByCountry(country, limit)
        if (stations.length === 0) return text(`No stations in "${country}".`)
        return text(`Top stations in ${country}:\n\n${stations.map((s, i) => formatStation(s, i)).join("\n\n")}`)
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "get_top_voted",
    {
      title: "Get top voted",
      description: "The most-voted stations on the whole network — a good 'what's live right now' pulse.",
      inputSchema: z.object(
    { limit: z.number().int().min(1).max(25).default(10) }),
      annotations: READ_ONLY,
    },
    async ({ limit }) => {
      try {
        const stations = await topVoted(limit)
        return text(`Most-voted stations:\n\n${stations.map((s, i) => formatStation(s, i)).join("\n\n")}`)
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof RadioError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
