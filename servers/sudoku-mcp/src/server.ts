import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { generate } from "./api.js"
import { solve } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "sudoku-mcp", version: "1.0.0" })
  server.registerTool(
    "generate",
    {
      title: "Generate",
      description: "Generate a Sudoku puzzle with a difficulty.",
      inputSchema: z.object( { difficulty: z.string().describe("easy, medium, hard, or expert.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await generate(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "solve",
    {
      title: "Solve",
      description: "Solve a Sudoku puzzle.",
      inputSchema: z.object( { grid: z.string().describe("81 digits, 0 for empty cells.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await solve(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
