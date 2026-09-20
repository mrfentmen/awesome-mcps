import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { formatCharacter, getCharacter, searchCharacters, StapiError } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "stapi-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "search_characters",
    {
      title: "Search characters",
      description: "Search Star Trek characters by name across all series and movies.",
      inputSchema: z.object({
        name: z.string().describe("Name to search, e.g. 'Picard', 'Spock', 'Janeway'"),
        limit: z.number().int().min(1).max(50).default(5),
      }),
      annotations: READ_ONLY,
    },
    async ({ name, limit }) => {
      try {
        const results = await searchCharacters(name, limit)
        if (results.length === 0) return text(`No Star Trek characters match "${name}".`)
        return text(`Star Trek characters for "${name}":\n\n${results.map((c, i) => formatCharacter(c, i)).join("\n")}`)
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "get_character",
    {
      title: "Get character details",
      description: "Get a Star Trek character by uid: gender, birth year and place, height, marital status.",
      inputSchema: z.object({
        uid: z.string().describe("Character uid, e.g. 'CHMA0000015352' (use search_characters to find it)"),
      }),
      annotations: READ_ONLY,
    },
    async ({ uid }) => {
      try {
        const c = await getCharacter(uid)
        if (!c) return text(`No Star Trek character ${uid}.`)
        return text(formatCharacter(c))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof StapiError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
