import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { format, inspectConfigWeather } from "./core.js"
const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const errorText = (error: unknown) => text(`Error: ${error instanceof Error ? error.message : String(error)}`)
export function createServer() {
  const server = new McpServer({ name: "config-weather-mcp", version: "1.0.0" })
  server.registerTool(
    "inspect_config_weather",
    {
      title: "Inspect config weather",
      description: "Measure local configuration complexity and environment contract pressure without returning values, keys, paths, or source.",
      inputSchema: z.object( { project: z.string().min(1).max(1000).default(".") }),
      annotations: READ_ONLY,
    },
    async (input) => { try { return text(format(await inspectConfigWeather(input))) } catch (error) { return errorText(error) } }
  )
  return server
}
