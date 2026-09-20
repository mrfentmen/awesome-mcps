import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { indicator } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "oecd-mcp", version: "1.0.0" })
  server.registerTool(
    "indicator",
    {
      title: "Indicator",
      description: "Get an indicator series.",
      inputSchema: z.object( { dataset: z.string().describe("Dataset id like SNA_TABLE1.").optional(), country: z.string().describe("Country code like AUS."), series: z.string().describe("Series like GDP.").optional(), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await indicator(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
