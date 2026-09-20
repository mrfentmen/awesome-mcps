import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { noteFrequency } from "./api.js"
import { noteFromName } from "./api.js"
import { noteName } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "midi-tools-mcp", version: "1.0.0" })
  server.registerTool(
    "note_name",
    {
      title: "Note name",
      description: "Get the note name for a MIDI number.",
      inputSchema: z.object( { midi: z.number().describe("MIDI note number 0 to 127.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await noteName(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "note_frequency",
    {
      title: "Note frequency",
      description: "Get the frequency of a MIDI note.",
      inputSchema: z.object( { midi: z.number().describe("MIDI note number.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await noteFrequency(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "note_from_name",
    {
      title: "Note from name",
      description: "Get the MIDI number for a note name.",
      inputSchema: z.object( { name: z.string().describe("Note name like C4 or F#3.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await noteFromName(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
