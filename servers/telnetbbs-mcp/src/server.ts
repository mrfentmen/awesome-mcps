import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { BbsError, formatBbs, listAll } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "telnetbbs-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "list_bbses",
    {
      title: "List bbses",
      description: "List live retro BBSes you can dial into right now. Optionally filter " +
      "by name or software (Synchronet, Mystic, WWIV).",
      inputSchema: z.object(
    {
      query: z.string().optional().describe("Filter by name or software keyword"),
      limit: z.number().int().min(1).max(50).default(15),
    }),
      annotations: READ_ONLY,
    },
    async ({ query, limit }) => {
      try {
        let all = await listAll()
        if (query) {
          const q = query.toLowerCase()
          all = all.filter(
            (b) =>
              b.name.toLowerCase().includes(q) ||
              (b.software ?? "").toLowerCase().includes(q)
          )
        }
        if (all.length === 0) return text(`No BBSes match "${query ?? ""}".`)
        const shown = all.slice(0, limit)
        return text(
          `${shown.length} of ${all.length} BBSes:\n\n` +
            shown.map((b, i) => formatBbs(b, i)).join("\n\n")
        )
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "get_bbs",
    {
      title: "Get bbs",
      description: "Get the full listing for a specific BBS by name.",
      inputSchema: z.object(
    { name: z.string().describe("BBS name, e.g. '0xDECAFBAD BBS'") }),
      annotations: READ_ONLY,
    },
    async ({ name }) => {
      try {
        const all = await listAll()
        const found = all.find(
          (b) => b.name.toLowerCase() === name.toLowerCase()
        )
        if (!found) return text(`No BBS named "${name}". Try list_bbses first.`)
        return text(formatBbs(found))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "random_bbs",
    {
      title: "Random bbs",
      description: "Pick a random live BBS to explore, for the true dial up experience.",
      inputSchema: z.object({}),
      annotations: READ_ONLY,
    },
    async () => {
      try {
        const all = await listAll()
        if (all.length === 0) return text("No BBSes found.")
        const pick = all[Math.floor(Math.random() * all.length)]
        return text(`Dialing ${pick.name}...\n\n${formatBbs(pick)}`)
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof BbsError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
