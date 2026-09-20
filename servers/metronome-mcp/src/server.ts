import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { bpmToMs } from "./api.js"
import { noteDuration } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "metronome-mcp", version: "1.0.0" })
  server.registerTool(
    "bpm_to_ms",
    {
      title: "Bpm to ms",
      description: "Convert BPM to beat and bar durations.",
      inputSchema: z.object( { bpm: z.number().describe("Beats per minute."), beats_per_bar: z.number().describe("Beats per bar.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await bpmToMs(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "note_duration",
    {
      title: "Note duration",
      description: "Get note durations in milliseconds at a BPM.",
      inputSchema: z.object( { bpm: z.number().describe("Beats per minute.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await noteDuration(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
