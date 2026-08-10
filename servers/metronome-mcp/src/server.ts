import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { bpmToMs } from "./api.js"
import { noteDuration } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "metronome-mcp", version: "1.0.0" })
  server.tool("bpm_to_ms", "Convert BPM to beat and bar durations.", { bpm: z.number().describe("Beats per minute."), beats_per_bar: z.number().describe("Beats per bar.").optional() }, async (args) => {
    try { return text(await bpmToMs(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("note_duration", "Get note durations in milliseconds at a BPM.", { bpm: z.number().describe("Beats per minute.") }, async (args) => {
    try { return text(await noteDuration(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
