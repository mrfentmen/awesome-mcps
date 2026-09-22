import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { deviceStatus, formatDevice, HubitatError, listDevices, sendCommand } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const WRITE = { readOnlyHint: false, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "hubitat-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "list_devices",
    {
      title: "List devices",
      description: "Hubitat devices via Maker API: ids, labels, types.",
      inputSchema: z.object({}),
      annotations: READ_ONLY,
    },
    async () => {
      try {
        const rows = await listDevices()
        if (rows.length === 0) return text("No devices.")
        return text(rows.map((d, i) => formatDevice(d, i)).join("\n"))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "device_status",
    {
      title: "Device status",
      description: "One device with current attribute values (switch, level, temperature...).",
      inputSchema: z.object({
        id: z.string().describe("Numeric device id (use list_devices)"),
      }),
      annotations: READ_ONLY,
    },
    async ({ id }) => {
      try {
        return text(await deviceStatus(id))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "send_command",
    {
      title: "Send command",
      description: "Send a command to a device, e.g. on/off with optional value.",
      inputSchema: z.object({
        id: z.string().describe("Numeric device id"),
        command: z.string().describe("Command, e.g. 'on', 'off', 'setLevel'"),
        value: z.string().default("").describe("Optional value, e.g. '75' for setLevel"),
      }),
      annotations: WRITE,
    },
    async ({ id, command, value }) => {
      try {
        return text(await sendCommand(id, command, value))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof HubitatError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
