import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { noteFrequency } from "./api.js"
import { noteFromName } from "./api.js"
import { noteName } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "midi-tools-mcp", version: "1.0.0" })
  server.tool("note_name", "Get the note name for a MIDI number.", { midi: z.number().describe("MIDI note number 0 to 127.") }, async (args) => {
    try { return text(await noteName(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("note_frequency", "Get the frequency of a MIDI note.", { midi: z.number().describe("MIDI note number.") }, async (args) => {
    try { return text(await noteFrequency(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("note_from_name", "Get the MIDI number for a note name.", { name: z.string().describe("Note name like C4 or F#3.") }, async (args) => {
    try { return text(await noteFromName(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
