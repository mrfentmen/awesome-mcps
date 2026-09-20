import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { estimateAge } from "./api.js"
import { estimateGender } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "name-age-mcp", version: "1.0.0" })
  server.registerTool(
    "estimate_age",
    {
      title: "Estimate age",
      description: "Estimate the typical age for a first name.",
      inputSchema: z.object( { name: z.string().describe("First name.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await estimateAge(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "estimate_gender",
    {
      title: "Estimate gender",
      description: "Estimate the gender for a first name.",
      inputSchema: z.object( { name: z.string().describe("First name.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await estimateGender(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
