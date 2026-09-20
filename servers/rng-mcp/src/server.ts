import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { coinFlip } from "./api.js"
import { randomNumber } from "./api.js"
import { rollDice } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "rng-mcp", version: "1.0.0" })
  server.registerTool(
    "roll_dice",
    {
      title: "Roll dice",
      description: "Roll one or more dice.",
      inputSchema: z.object( { count: z.number().describe("How many dice.").optional(), sides: z.number().describe("Sides per die.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await rollDice(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "coin_flip",
    {
      title: "Coin flip",
      description: "Flip a coin.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await coinFlip(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "random_number",
    {
      title: "Random number",
      description: "A random integer in a range.",
      inputSchema: z.object( { min: z.number().describe("Minimum.").optional(), max: z.number().describe("Maximum.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await randomNumber(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
