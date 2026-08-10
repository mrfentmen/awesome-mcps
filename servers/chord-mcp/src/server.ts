import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { chordNotes } from "./api.js"
import { scaleNotes } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "chord-mcp", version: "1.0.0" })
  server.tool("chord_notes", "Get the notes of a chord.", { root: z.string().describe("Root note like C or F#."), chord: z.string().describe("Chord type like maj, min, 7.").optional() }, async (args) => {
    try { return text(await chordNotes(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("scale_notes", "Get the notes of a scale.", { root: z.string().describe("Root note."), scale: z.string().describe("Scale like major or minor.").optional() }, async (args) => {
    try { return text(await scaleNotes(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
