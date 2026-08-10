import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { coinFlip } from "./api.js"
import { randomNumber } from "./api.js"
import { rollDice } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "rng-mcp", version: "1.0.0" })
  server.tool("roll_dice", "Roll one or more dice.", { count: z.number().describe("How many dice.").optional(), sides: z.number().describe("Sides per die.").optional() }, async (args) => {
    try { return text(await rollDice(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("coin_flip", "Flip a coin.", {  }, async (args) => {
    try { return text(await coinFlip(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("random_number", "A random integer in a range.", { min: z.number().describe("Minimum.").optional(), max: z.number().describe("Maximum.").optional() }, async (args) => {
    try { return text(await randomNumber(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
