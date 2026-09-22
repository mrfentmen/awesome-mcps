import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { coneSearch, lookupObject, SimbadError } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "simbad-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "lookup_object",
    {
      title: "Look up object",
      description: "Look up an astronomical object by name: id, type, coordinates.",
      inputSchema: z.object({
        ident: z.string().describe("Object name, e.g. 'Vega', 'M31', 'Crab Nebula'"),
      }),
      annotations: READ_ONLY,
    },
    async ({ ident }) => {
      try {
        return text(await lookupObject(ident))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "cone_search",
    {
      title: "Cone search",
      description: "Objects within a sky region by RA/Dec and radius.",
      inputSchema: z.object({
        ra: z.number().min(0).max(360).describe("Right ascension in degrees"),
        dec: z.number().min(-90).max(90).describe("Declination in degrees"),
        radius: z.number().min(0.01).max(5).default(0.1).describe("Radius in degrees"),
        limit: z.number().int().min(1).max(50).default(10),
      }),
      annotations: READ_ONLY,
    },
    async ({ ra, dec, radius, limit }) => {
      try {
        return text(await coneSearch(ra, dec, radius, limit))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof SimbadError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
