import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { formatQuestion, getCategories, getQuestions, TriviaError } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })

export function createServer(): McpServer {
  const server = new McpServer({
    name: "opentdb-mcp",
    version: "1.0.0",
  })

  server.tool(
    "get_categories",
    "List every trivia category with its id.",
    {},
    async () => {
      try {
        const cats = await getCategories()
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
        const qs = await getQuestions(amount, category, difficulty, type)
        const filters = [category != null ? `category ${category}` : "", difficulty ?? "", type ?? ""].filter(Boolean).join(", ")
        return text(`Trivia questions${filters ? ` (${filters})` : ""}:\n\n${qs.map((q, i) => formatQuestion(q, i)).join("\n\n")}`)
      } catch (e) {
        return text(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof TriviaError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
