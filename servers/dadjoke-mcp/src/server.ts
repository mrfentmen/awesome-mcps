import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { DadJokeError, getJoke, randomJoke, searchJokes } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "dadjoke-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "random_joke",
    {
      title: "Random dad joke",
      description: "Get a random dad joke.",
      inputSchema: z.object({}),
      annotations: READ_ONLY,
    },
    async () => {
      try {
        return text((await randomJoke()).joke)
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "search_jokes",
    {
      title: "Search dad jokes",
      description: "Search dad jokes by keyword.",
      inputSchema: z.object({
        term: z.string().describe("Keyword, e.g. 'bicycle', 'dog', 'programmer'"),
        limit: z.number().int().min(1).max(30).default(5),
      }),
      annotations: READ_ONLY,
    },
    async ({ term, limit }) => {
      try {
        const results = await searchJokes(term, limit)
        if (results.length === 0) return text(`No dad jokes about "${term}".`)
        return text(results.map((j, i) => `${i + 1}. ${j.joke}`).join("\n\n"))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "get_joke",
    {
      title: "Get joke by id",
      description: "Get one dad joke by its id.",
      inputSchema: z.object({
        id: z.string().describe("Joke id from search results"),
      }),
      annotations: READ_ONLY,
    },
    async ({ id }) => {
      try {
        return text((await getJoke(id)).joke)
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof DadJokeError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
