import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { fullStatus, readSensor, setPower, TasmotaError } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const WRITE = { readOnlyHint: false, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "tasmota-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "status",
    {
      title: "Device status",
      description: "Tasmota device info, power state, uptime, wifi. Set TASMOTA_URL for your device.",
      inputSchema: z.object({}),
      annotations: READ_ONLY,
    },
    async () => {
      try {
        return text(await fullStatus())
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "set_power",
    {
      title: "Set power",
      description: "Switch a Tasmota outlet on, off, or toggle. Point TASMOTA_URL at each device.",
      inputSchema: z.object({
        state: z.enum(["on", "off", "toggle"]).default("toggle"),
        outlet: z.number().int().min(1).max(8).default(1),
      }),
      annotations: WRITE,
    },
    async ({ state, outlet }) => {
      try {
        return text(await setPower(state, outlet))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "read_sensor",
    {
      title: "Read sensors",
      description: "Sensor readings (temperature, humidity, energy...) if the device has sensors.",
      inputSchema: z.object({}),
      annotations: READ_ONLY,
    },
    async () => {
      try {
        return text(await readSensor())
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof TasmotaError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
