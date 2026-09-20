import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import {
  DatamuseError,
  formatHits,
  formatWithDefs,
  meansLike,
  relatedTo,
  rhymesWith,
  spellCheck,
  suggest,
} from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "datamuse-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "rhymes_with",
    {
      title: "Rhymes with",
      description: "Find words that rhyme with a word.",
      inputSchema: z.object(
    { word: z.string().describe("The word to rhyme"), limit: z.number().int().min(1).max(50).default(10) }),
      annotations: READ_ONLY,
    },
    async ({ word, limit }) => {
      try {
        const hits = await rhymesWith(word, limit)
        return text(hits.length ? `Words that rhyme with "${word}":\n${formatHits(hits)}` : `No rhymes for "${word}".`)
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "means_like",
    {
      title: "Means like",
      description: "Find words and phrases with a similar meaning, with definitions.",
      inputSchema: z.object(
    { word: z.string().describe("The meaning to match, e.g. 'retro gaming'"), limit: z.number().int().min(1).max(50).default(10) }),
      annotations: READ_ONLY,
    },
    async ({ word, limit }) => {
      try {
        const hits = await meansLike(word, limit)
        return text(hits.length ? `Words meaning like "${word}":\n${formatWithDefs(hits)}` : `Nothing meaning like "${word}".`)
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "related_to",
    {
      title: "Related to",
      description: "Find words commonly associated with a topic.",
      inputSchema: z.object(
    { word: z.string().describe("The topic, e.g. 'cave'"), limit: z.number().int().min(1).max(50).default(10) }),
      annotations: READ_ONLY,
    },
    async ({ word, limit }) => {
      try {
        const hits = await relatedTo(word, limit)
        return text(hits.length ? `Words related to "${word}":\n${formatHits(hits)}` : `Nothing related to "${word}".`)
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "spell_check",
    {
      title: "Spell check",
      description: "Check a word's spelling and get corrections.",
      inputSchema: z.object(
    { word: z.string().describe("The word to check") }),
      annotations: READ_ONLY,
    },
    async ({ word }) => {
      try {
        const hits = await spellCheck(word)
        const correct = hits.some((h) => h.word.toLowerCase() === word.toLowerCase())
        const body = hits.length ? `Closest matches:\n${formatHits(hits)}` : "No close matches."
        return text(correct ? `"${word}" looks correctly spelled. ${body}` : `"${word}" may be misspelled. ${body}`)
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "word_suggestions",
    {
      title: "Word suggestions",
      description: "Suggest words starting with a prefix.",
      inputSchema: z.object(
    { prefix: z.string().describe("Word start, e.g. 'comp'"), limit: z.number().int().min(1).max(50).default(10) }),
      annotations: READ_ONLY,
    },
    async ({ prefix, limit }) => {
      try {
        const hits = await suggest(prefix, limit)
        return text(hits.length ? `Words starting with "${prefix}":\n${formatHits(hits)}` : `Nothing starts with "${prefix}".`)
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof DatamuseError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
