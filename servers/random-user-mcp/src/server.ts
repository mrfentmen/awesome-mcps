import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { generate } from "./api.js"
import { seed } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "random-user-mcp", version: "1.0.0" })
  server.tool("generate", "Generate random user profiles.", { count: z.number().describe("How many profiles.").optional(), gender: z.string().describe("male, female, or any.").optional(), nat: z.string().describe("Nationality code, for example us or gb.").optional() }, async (args) => {
    try { return text(await generate(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("seed", "Generate the same profiles every time with a seed.", { seed: z.string().describe("Seed value."), count: z.number().describe("How many profiles.").optional() }, async (args) => {
    try { return text(await seed(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
