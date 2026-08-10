import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { anagramsOf } from "./api.js"
import { checkAnagram } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "anagram-mcp", version: "1.0.0" })
  server.tool("check_anagram", "Check if two words are anagrams.", { a: z.string().describe("First word."), b: z.string().describe("Second word.") }, async (args) => {
    try { return text(await checkAnagram(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("anagrams_of", "Generate anagrams of a word.", { word: z.string().describe("Word to rearrange."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await anagramsOf(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
