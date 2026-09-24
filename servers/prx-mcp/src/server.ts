import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import {
  errorMessage,
  listPodcasts,
  getPodcast,
  listEpisodes,
  getEpisode,
} from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "prx-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "list_podcasts",
    {
      title: "List podcasts",
      description: "PRX podcasts, paginated. No key needed.",
      inputSchema: z.object({
        page: z.string().describe("Page number.").optional(),
        per: z.string().describe("Items per page.").optional()
      }),
      annotations: READ_ONLY,
    },
    async ({ page, per }) => {
      try {
        return text(await listPodcasts(page, per));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "get_podcast",
    {
      title: "Get podcast",
      description: "Single PRX podcast by ID.",
      inputSchema: z.object({
        podcast_id: z.string().describe("Numeric podcast ID.")
      }),
      annotations: READ_ONLY,
    },
    async ({ podcast_id }) => {
      try {
        return text(await getPodcast(podcast_id));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "list_episodes",
    {
      title: "List episodes",
      description: "PRX episodes, paginated. No key needed.",
      inputSchema: z.object({
        page: z.string().describe("Page number.").optional(),
        per: z.string().describe("Items per page.").optional()
      }),
      annotations: READ_ONLY,
    },
    async ({ page, per }) => {
      try {
        return text(await listEpisodes(page, per));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "get_episode",
    {
      title: "Get episode",
      description: "Single PRX episode by UUID.",
      inputSchema: z.object({
        episode_id: z.string().describe("Episode UUID.")
      }),
      annotations: READ_ONLY,
    },
    async ({ episode_id }) => {
      try {
        return text(await getEpisode(episode_id));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  return server
}