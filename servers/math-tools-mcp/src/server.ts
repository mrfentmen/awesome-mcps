import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { gcdLcm } from "./api.js"
import { primeFactors } from "./api.js"
import { stats } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "math-tools-mcp", version: "1.0.0" })
  server.registerTool(
    "prime_factors",
    {
      title: "Prime factors",
      description: "Prime factors of a number.",
      inputSchema: z.object( { value: z.number().describe("Integer up to 1e12.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await primeFactors(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "gcd_lcm",
    {
      title: "Gcd lcm",
      description: "Greatest common divisor and least common multiple.",
      inputSchema: z.object( { a: z.number().describe("First number."), b: z.number().describe("Second number.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await gcdLcm(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "stats",
    {
      title: "Stats",
      description: "Mean, median, mode, and standard deviation of a list.",
      inputSchema: z.object( { values: z.string().describe("Comma separated numbers.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await stats(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
