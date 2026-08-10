import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { generate } from "./api.js"
import { solve } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "sudoku-mcp", version: "1.0.0" })
  server.tool("generate", "Generate a Sudoku puzzle with a difficulty.", { difficulty: z.string().describe("easy, medium, hard, or expert.").optional() }, async (args) => {
    try { return text(await generate(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("solve", "Solve a Sudoku puzzle.", { grid: z.string().describe("81 digits, 0 for empty cells.") }, async (args) => {
    try { return text(await solve(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
