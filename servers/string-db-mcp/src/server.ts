import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { network } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "string-db-mcp", version: "1.0.0" })
  server.tool("network", "Interaction partners for a protein.", { proteins: z.string().describe("Comma separated gene names."), species: z.number().describe("NCBI tax id like 9606.").optional() }, async (args) => {
    try { return text(await network(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
