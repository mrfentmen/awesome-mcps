import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { gcdLcm } from "./api.js"
import { primeFactors } from "./api.js"
import { stats } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "math-tools-mcp", version: "1.0.0" })
  server.tool("prime_factors", "Prime factors of a number.", { value: z.number().describe("Integer up to 1e12.") }, async (args) => {
    try { return text(await primeFactors(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("gcd_lcm", "Greatest common divisor and least common multiple.", { a: z.number().describe("First number."), b: z.number().describe("Second number.") }, async (args) => {
    try { return text(await gcdLcm(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("stats", "Mean, median, mode, and standard deviation of a list.", { values: z.string().describe("Comma separated numbers.") }, async (args) => {
    try { return text(await stats(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
