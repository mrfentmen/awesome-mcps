import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_categories, m0_getQuestion, m1_formatQuestion, m1_getCategories, m1_getQuestions, m1_TriviaError } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'trivia-mcp', version: '1.0.0' })
server.tool("get_question", "Get a random trivia question.", { category: z.string().describe("Category name.").optional(), difficulty: z.string().describe("easy, medium, or hard.").optional() }, async (args) => {
    try { return text(await m0_getQuestion(args)) } catch (e) { return text(error(e)) }
  })
server.tool("categories", "List available trivia categories.", {  }, async (args) => {
    try { return text(await m0_categories(args)) } catch (e) { return text(error(e)) }
  })
server.tool(
    "get_categories",
    "List every trivia category with its id.",
    {},
    async () => {
      try {
        const cats = await m1_getCategories()
        return text(`Trivia categories:\n${cats.map((c) => `- ${c.id}: ${c.name}`).join("\n")}`)
      } catch (e) {
        return text(errorMessage(e))
      }
    }
  )
server.tool(
    "get_questions",
    "Get trivia questions with answers.",
    {
      amount: z.number().int().min(1).max(50).default(10),
      category: z.number().int().optional().describe("Category id from get_categories"),
      difficulty: z.enum(["easy", "medium", "hard"]).optional(),
      type: z.enum(["multiple", "boolean"]).optional().describe("Multiple choice or true/false"),
    },
    async ({ amount, category, difficulty, type }) => {
      try {
        const qs = await m1_getQuestions(amount, category, difficulty, type)
        const filters = [category != null ? `category ${category}` : "", difficulty ?? "", type ?? ""].filter(Boolean).join(", ")
        return text(`Trivia questions${filters ? ` (${filters})` : ""}:\n\n${qs.map((q, i) => m1_formatQuestion(q, i)).join("\n\n")}`)
      } catch (e) {
        return text(errorMessage(e))
      }
    }
  )
  return server
}
