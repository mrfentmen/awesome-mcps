import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { character } from "./api.js"
import { house } from "./api.js"
import { spells } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "harry-potter-mcp", version: "1.0.0" })
  server.tool("character", "Character by name.", { name: z.string().describe("Character name."), limit: z.number().describe("Maximum results.").optional() }, async (args) => {
    try { return text(await character(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("house", "Members of a house.", { house: z.string().describe("Gryffindor, Slytherin, Ravenclaw, or Hufflepuff."), limit: z.number().describe("Maximum results.").optional() }, async (args) => {
    try { return text(await house(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("spells", "All spells.", { limit: z.number().describe("Maximum results.").optional() }, async (args) => {
    try { return text(await spells(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
