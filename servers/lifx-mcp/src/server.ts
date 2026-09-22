import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { formatLight, LifxError, listLights, setPower } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const WRITE = { readOnlyHint: false, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "lifx-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "list_lights",
    {
      title: "List lights",
      description: "LIFX lights with power, brightness, color, online state.",
      inputSchema: z.object({}),
      annotations: READ_ONLY,
    },
    async () => {
      try {
        const rows = await listLights()
        if (rows.length === 0) return text("No lights.")
        return text(rows.map((l, i) => formatLight(l, i)).join("\n"))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "set_power",
    {
      title: "Set power",
      description: "Turn LIFX lights on or off with brightness.",
      inputSchema: z.object({
        selector: z.string().describe("Selector: 'all', 'label:Desk', 'group:Living Room', or light id"),
        power: z.enum(["on", "off", "toggle"]).default("toggle"),
        brightness: z.number().min(0).max(1).default(1).describe("0 (dim) to 1 (full)"),
      }),
      annotations: WRITE,
    },
    async ({ selector, power, brightness }) => {
      try {
        return text(await setPower(selector, power, brightness))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof LifxError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
