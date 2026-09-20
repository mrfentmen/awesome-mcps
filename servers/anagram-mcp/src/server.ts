import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { anagramsOf } from "./api.js"
import { checkAnagram } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "anagram-mcp", version: "1.0.0" })
  server.registerTool(
    "check_anagram",
    {
      title: "Check anagram",
      description: "Check if two words are anagrams.",
      inputSchema: z.object( { a: z.string().describe("First word."), b: z.string().describe("Second word.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await checkAnagram(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "anagrams_of",
    {
      title: "Anagrams of",
      description: "Generate anagrams of a word.",
      inputSchema: z.object( { word: z.string().describe("Word to rearrange."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await anagramsOf(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
