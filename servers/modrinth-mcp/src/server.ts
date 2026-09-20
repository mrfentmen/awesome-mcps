import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import {
  ModrinthError,
  formatHit,
  formatProject,
  formatVersion,
  getProject,
  getProjectVersions,
  searchProjects,
} from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "modrinth-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "search_mods",
    {
      title: "Search mods",
      description: "Search Modrinth for Minecraft mods/modpacks/plugins, optionally " +
      "filtered by loader (fabric/forge/neoforge/quilt) and game version.",
      inputSchema: z.object(
    {
      query: z.string().describe("e.g. 'sodium', 'create', 'journeymap'"),
      loader: z.string().optional().describe("e.g. 'fabric', 'forge', 'neoforge'"),
      gameVersion: z.string().optional().describe("e.g. '1.20.1', '1.21'"),
      limit: z.number().int().min(1).max(20).default(10).describe("Max results"),
    }),
      annotations: READ_ONLY,
    },
    async ({ query, loader, gameVersion, limit }) => {
      try {
        const hits = await searchProjects(query, "mod", loader, gameVersion, limit)
        if (hits.length === 0) {
          return text(`No mods found for "${query}".`)
        }
        const head = `Mods matching "${query}"` +
          (loader ? ` (loader: ${loader})` : "") +
          (gameVersion ? ` (MC ${gameVersion})` : "") + ":\n"
        return text(head + hits.map((h, i) => formatHit(h, i + 1)).join("\n\n"))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "get_mod",
    {
      title: "Get mod",
      description: "Get full details for a Modrinth project by slug: description, " +
      "loaders, supported game versions, stats.",
      inputSchema: z.object(
    { slug: z.string().describe("Mod slug, e.g. 'sodium' or 'create'") }),
      annotations: READ_ONLY,
    },
    async ({ slug }) => {
      try {
        const project = await getProject(slug)
        if (!project) return text(`No Modrinth project "${slug}".`)
        return text(formatProject(project))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "get_mod_versions",
    {
      title: "Get mod versions",
      description: "List versions of a mod, optionally filtered by loader and game " +
      "version, with download links and required dependencies.",
      inputSchema: z.object(
    {
      slug: z.string().describe("Mod slug, e.g. 'sodium'"),
      loader: z.string().optional().describe("e.g. 'fabric', 'forge'"),
      gameVersion: z.string().optional().describe("e.g. '1.20.1'"),
      limit: z.number().int().min(1).max(20).default(5).describe("Max versions"),
    }),
      annotations: READ_ONLY,
    },
    async ({ slug, loader, gameVersion, limit }) => {
      try {
        const versions = await getProjectVersions(slug, loader, gameVersion, limit)
        if (versions.length === 0) {
          return text(
            `No versions of "${slug}"${loader ? ` for ${loader}` : ""}${gameVersion ? ` on ${gameVersion}` : ""}.`
          )
        }
        return text(
          `Versions of "${slug}":\n` +
            versions.map((v, i) => formatVersion(v, i + 1)).join("\n\n")
        )
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof ModrinthError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
