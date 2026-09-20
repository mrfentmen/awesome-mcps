import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { codename } from "./api.js"
import { randomName } from "./api.js"
import { username } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "name-generator-mcp", version: "1.0.0" })
  server.registerTool(
    "random_name",
    {
      title: "Random name",
      description: "Generate a random full name.",
      inputSchema: z.object( { count: z.number().describe("How many.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await randomName(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "username",
    {
      title: "Username",
      description: "Generate a random username.",
      inputSchema: z.object( { count: z.number().describe("How many.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await username(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "codename",
    {
      title: "Codename",
      description: "Generate a random project codename.",
      inputSchema: z.object( { count: z.number().describe("How many.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await codename(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
