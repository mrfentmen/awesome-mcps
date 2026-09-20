import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { chordNotes } from "./api.js"
import { scaleNotes } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "chord-mcp", version: "1.0.0" })
  server.registerTool(
    "chord_notes",
    {
      title: "Chord notes",
      description: "Get the notes of a chord.",
      inputSchema: z.object( { root: z.string().describe("Root note like C or F#."), chord: z.string().describe("Chord type like maj, min, 7.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await chordNotes(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "scale_notes",
    {
      title: "Scale notes",
      description: "Get the notes of a scale.",
      inputSchema: z.object( { root: z.string().describe("Root note."), scale: z.string().describe("Scale like major or minor.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await scaleNotes(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
