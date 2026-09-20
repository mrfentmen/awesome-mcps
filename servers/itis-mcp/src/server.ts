import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { commonNames, formatTaxon, hierarchy, ItisError, searchScientific } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "itis-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "search_scientific",
    {
      title: "Search scientific names",
      description: "Search ITIS taxonomy by scientific name: TSN, author.",
      inputSchema: z.object({
        name: z.string().describe("Scientific name, e.g. 'Panthera leo'"),
        limit: z.number().int().min(1).max(20).default(5),
      }),
      annotations: READ_ONLY,
    },
    async ({ name, limit }) => {
      try {
        const results = await searchScientific(name, limit)
        if (results.length === 0) return text(`No ITIS taxa match "${name}".`)
        return text(`ITIS results for "${name}":\n\n${results.map((t, i) => formatTaxon(t, i)).join("\n")}`)
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "common_names",
    {
      title: "Common names",
      description: "Common names for a TSN, e.g. lion, puma, cougar.",
      inputSchema: z.object({
        tsn: z.string().describe("Numeric TSN, e.g. '183803' (use search_scientific to find it)"),
        limit: z.number().int().min(1).max(30).default(10),
      }),
      annotations: READ_ONLY,
    },
    async ({ tsn, limit }) => {
      try {
        const names = await commonNames(tsn, limit)
        if (names.length === 0) return text(`No common names for TSN ${tsn}.`)
        return text(`Common names for TSN ${tsn}:\n\n${names.map((n, i) => `${i + 1}. ${n}`).join("\n")}`)
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "hierarchy",
    {
      title: "Taxonomic hierarchy",
      description: "Hierarchy below a TSN: ranks and taxon names.",
      inputSchema: z.object({
        tsn: z.string().describe("Numeric TSN, e.g. '183803'"),
      }),
      annotations: READ_ONLY,
    },
    async ({ tsn }) => {
      try {
        const rows = await hierarchy(tsn)
        if (rows.length === 0) return text(`No hierarchy for TSN ${tsn}.`)
        return text(`Hierarchy for TSN ${tsn}:\n\n${rows.join("\n")}`)
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof ItisError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
