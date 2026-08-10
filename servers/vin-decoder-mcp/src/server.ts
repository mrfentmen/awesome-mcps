import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { decodeVin } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "vin-decoder-mcp", version: "1.0.0" })
  server.tool("decode_vin", "Decode a VIN into vehicle details.", { vin: z.string().describe("17 character VIN.") }, async (args) => {
    try { return text(await decodeVin(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
